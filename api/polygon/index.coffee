# API server for polygon, a framework for serving and executing GPT-3 templates

console.log "Starting polygon API server..."

# Imports: express, axios, and vovas-notion
express = require 'express'
axios = require 'axios'
Notion = require('vovas-notion').default
_ = require 'lodash'
console.log Notion

{ POLYGON_TOKEN, NODE_ENV, OPENAI_KEY, MIXPANEL_TOKEN } = process.env

# Create a new express app
app = express()

# Get IP in request
app.set 'trust proxy', ( ip ) ->
  console.log "Got IP #{ip}"
  true

# Create a new notion client with env.POLYGON_TOKEN as the token
notion = new Notion(POLYGON_TOKEN, { debug: true })

mixpanel = require('mixpanel').init(MIXPANEL_TOKEN)

crypto = require 'crypto'

log = (...args) ->
  console.log ...args
  args[args.length - 1]

# Health check endpoint
app.get '/health', ( req, res ) => res.send 'ok'

# Get template by ID
app.get '/template/:id', ({ params: { id } }, res) ->

  try

    console.log "Getting template #{id}..."
    { text } = await notion.getPage(id)
    console.log "Got template #{id}."
    res.send text

  catch err
    console.error err
    res.status(500).send err

templatesBySlug = {}

getTemplates = ( databaseId, reload ) ->

  # console.log "Getting templates for database #{databaseId}..."

  if reload or not templatesBySlug[databaseId]

    # console.log "Getting templates from Notion..."  
    results = await notion.queryDatabase(databaseId, {})
    # console.log "Found #{results.length} templates."

    templatesBySlug[databaseId] = _(results)
      .map ({ slug, raw: { id }, ...properties }) -> [ slug, { id, ...properties } ]
      .fromPairs()
      .value()

  templatesBySlug[databaseId]

getTemplate =  ( databaseId, slug ) ->

  console.log "Getting template #{slug} for database #{databaseId}..."
  {[ slug ]: template} = await getTemplates(databaseId)
  log template

# Get all slug->id mappings for a database
app.get '/template-ids/:databaseId', ({ params: { databaseId }, query: { reload }}, res) ->

  try

    console.log "Getting template IDs... for database #{databaseId} (reload: #{reload})"
    res.send log _.mapValues await getTemplates(databaseId, reload), 'id'

  catch err

    console.error err
    res.status(500).send err

generations = []

# Upvote a generation
app.post '/upvote', ({ body: { generationId, databaseId }, res }) ->

  try

    console.log "Upvoting prompt/response pair #{generationId}:"
    request = _.find generations, { id: generationId }
    if not request
      console.log "No such prompt/response pair #{generationId}"
      res.send false
    else
      console.log request
      { prompt, response, template } = request

      await notion.createPage(
        parent: database_id: databaseId
        properties: { template, prompt, response }
      )

      res.send true

makePrompt = ({ template, variables, slug, databaseId }) ->

  { prompt } = template

  # Replace %...% in prompt with prompts with the same slug (recursively, but make sure we don't get stuck in a loop)
  getRefs = ( prompt ) -> prompt.match(/(?<=\%)([\w-]+)(?=\%)/g) ? []

  replaceRefs = ( prompt, slugsUsed = if slug then [ slug ] else [] ) ->

    for reffedSlug in refs = getRefs(prompt)

      if not databaseId
        throw new Error "Missing database ID (required for slug replacement)"

      console.log "Replacing %#{reffedSlug}% in template '#{_.last(slugsUsed)}'; refs: #{refs}"

      if slugsUsed.includes reffedSlug
        throw new Error "Circular reference in templates: #{slugsUsed.join ' -> '} -> #{reffedSlug}"
      
      reffedPrompt = await replaceRefs (
        ( await getTemplate( databaseId, reffedSlug ) ).prompt
      ), [ ...slugsUsed, reffedSlug ]

      prompt = prompt.replace "%#{reffedSlug}%", reffedPrompt
    
    prompt

  if getRefs(prompt)
    prompt = await replaceRefs prompt
    console.log "Prompt after slug replacement:\n#{prompt}"

  # Replace {{...}} in template with variables
  # Make sure the key is in the variables object
  prompt = prompt.replace /\{\{([\w-]+)\}\}/g, ( _, key ) ->
    if variables[key]
      variables[key]
    else
      throw new Error "Missing input #{key}" 

  console.log "Prompt after variable substitution:\n#{prompt}"

  prompt

# Run a template
app.post '/run', run = ({ ip, body, body: { template, openAIkey, databaseId, slug, parameters: { engine, ...parameters }, variables = {} } } = {}, res) ->

  try

    # If no openAIkey is provided, return a 401
    if not openAIkey
      throw new Error "Missing OpenAI key"
    
    console.log {arguments}

    keyHash = crypto.createHash('sha256').update(openAIkey).digest('hex')

    mixpanelParams = {
      environment: NODE_ENV
      ip
      n: parameters.n ? 1
      # Sha of openAIkey as distinct_id
      distinct_id: keyHash
      keyHash
      slug
      databaseId
      engine
      ...parameters
      # If no slug, use hash of template
      ...( if slug then {} else
        template_hash: crypto.createHash('sha256').update(template).digest('hex')
      )
    }

    mixpanel.track 'run', mixpanelParams, -> console.log "Tracked run", ...arguments

    if not template 

      console.log "Running template #{slug} for database #{databaseId} with engine #{engine} and parameters #{JSON.stringify(parameters)} and variables #{JSON.stringify(variables)}..."

      [ 'slug', 'databaseId' ].forEach ( param ) ->
        if not body[param]
          throw new Error  "Missing required body parameter #{param}"

      # Make sure we have the template IDs for the database
      template = await getTemplate(databaseId, slug)
      if not template
        throw new Error  "No template with slug '#{slug}' in database #{databaseId}; available slugs: #{_.keys(await getTemplates(databaseId)).join ', '}"

      console.log "Found template:\n#{template}"
    
    else

      console.log "Running user-provided template with engine #{engine} and parameters #{JSON.stringify(parameters)} and variables #{JSON.stringify(variables)}..."

    prompt = await makePrompt({ template, variables, slug, databaseId })

    Object.assign parameters, { prompt }

    engine ?= 'text-davinci-003'

    url = "https://api.openai.com/v1/engines/#{engine}/completions"

    try

      { data: { choices } } = await axios.post url, parameters,
        headers:
          Authorization: "Bearer #{openAIkey}"
      console.log "Got response from OpenAI: #{JSON.stringify(choices)}"

      choices = choices.map ({ text, finish_reason }) ->

        generation = {
          id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          template: slug
          prompt
          response: text
        }
        generations.push generation

        # Remove the request after 24 hours
        setTimeout ->
          _.remove generations, generation
          console.log "Removed request #{generation.id} from generations: #{JSON.stringify(generation)}"
        , 24 * 60 * 60 * 1000
      
        console.log "Added request #{generation.id} to generations: #{JSON.stringify(generation)}"

        text: text.trim()
        generationId: generation.id
        finishReason: finish_reason

      # Count the approximate cost of tokens spent: count characters in template + all choices and divide by 4,
      # then multiply by 0.02/1000 if engine contains 'davinci' or 0.002/1000 otherwise (we assume they won't be using ada or babbage)
      characterCount = _.sumBy [ prompt, ..._.map(choices, 'text') ], 'length'
      # console.log [ prompt, ..._.map(choices, 'text') ]
      console.log "Character count: #{characterCount}"
      approximateCost = Math.round( characterCount / 4 / 1000 * ( if engine.includes 'davinci' then 0.02 else 0.002 ) * 1e7 ) / 1e7
      console.log "Approximate cost: #{approximateCost}"
      
      output = {
        choices
        characterCount
        approximateCost
      }

      mixpanel.track 'completed', {
        ...mixpanelParams,
        generationIds: _.map(choices, 'generationId').join ','
        finishReasons: _.map(choices, 'finishReason').join ','
        characterCount
        approximateCost
      }, -> console.log "Tracked completed", ...arguments
      
      res?.send output

      console.log(output)
      output

    catch err
      if res && err.response?.status is 401
        res.status(401).send err
      else
        throw err

  catch err
    console.error err
    mixpanel.track 'error', {
      ...mixpanelParams
      error: err.message or err
    }, -> console.log "Tracked error", ...arguments
    if res
      res.status(500).send err
    else
      throw err

# Run a universal, hardcoded "generate anything" prompt
app.post '/generate', generate = ({ ip, body: { openAIkey, parameters, what: keys, for: args } = {} }, res) ->

  databaseId = '068baa7841324cc682aa3eb7cad4bd8c'
  slug = 'default'

  keys = keys.map _.camelCase
  feeder = "{\"#{keys[0]}\":"
  output = await run {
    ip
    body: {
      openAIkey
      databaseId
      slug
      parameters: {
        max_tokens: 100
        stop: "}'"
        ...parameters
      }
      variables: {
        keys: JSON.stringify keys
        args: JSON.stringify args
        feeder
      }
    }
  }
  
  console.log "Got output: #{JSON.stringify(output)}"
  { choices: [{ text, generationId, finishReason }], approximateCost, characterCount } = output

  text = feeder + text

  # Go backwards, adding either `` (nothing), `}`, `]}`, `"}`, or `"]}` to the end of the string until we have a valid JSON object
  tryParse = ( text ) -> try JSON.parse text

  output = do getObject = ( text ) ->
    object = null
    _.find [ '', '}', ']}', '"}', '"]}' ], ( suffix ) ->
      object = tryParse text + suffix
    if object 
      object
    else if text.length > 0
      getObject text.slice 0, -1
    else
      return res.status(500).send "Could not parse generated text: #{text}"
  
  res.send { ...output, _meta: {
    approximateCost, characterCount, generationId,
    incomplete: finishReason is 'length' or undefined
  } }

# Enable methods via GET (only for DEV environment) using env.OPENAI_KEY. Variables are taken directly from the query string.

if NODE_ENV is 'development'

  app.get '/run/:databaseId/:slug', ({ params: { databaseId, slug }, query: { parameters = "{}", ...query } }, res) ->
    console.log "Running template #{slug} for database #{databaseId} with variables #{JSON.stringify(query)} and parameters #{parameters}..." 
    run
      body: {
        openAIkey: OPENAI_KEY
        databaseId
        slug
        parameters: JSON.parse parameters
        variables: query
      }
      res
  
  app.get '/generate/:what/for/:for', ({ params: { what, for: firstArg }, query: { parameters = "{}", ...query } }, res) ->
    console.log "Running generate with variables #{JSON.stringify(query)} and parameters #{parameters}..." 
    generate
      body: {
        openAIkey: OPENAI_KEY
        what: what.split ','
        for: [ firstArg, query ]
        parameters: JSON.parse parameters
      }
      res

module.exports =
  path: '/api/polygon'
  handler: app