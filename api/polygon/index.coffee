# API server for polygon, a framework for serving and executing GPT-3 templates

console.log "Starting polygon API server..."

# Imports: express, axios, and vovas-notion
express = require 'express'
axios = require 'axios'
Notion = require('vovas-notion').default
_ = require 'lodash'
console.log Notion

# Take POLYGON_TOKEN, OPENAI_KEY, and POLYGON_DB_ID from environment variables
{ POLYGON_TOKEN } = process.env

# Create a new express app
app = express()

# Create a new notion client with env.POLYGON_TOKEN as the token
# tmp
notion = new Notion(POLYGON_TOKEN, { debug: true })

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


# Run a template
app.post '/run', ({ body, body: { openAIkey, databaseId, slug, engine, parameters = {}, variables = {} } } = {}, res) ->

  try

    # If no openAIkey is provided, return a 401
    if not openAIkey
      throw new Error "Missing OpenAI key"

    console.log "Running template #{slug} for database #{databaseId} with engine #{engine} and parameters #{JSON.stringify(parameters)} and variables #{JSON.stringify(variables)}..."

    [ 'slug', 'databaseId' ].forEach ( param ) ->
      if not body[param]
        throw new Error  "Missing required body parameter #{param}"

    # Make sure we have the template IDs for the database
    template = await getTemplate(databaseId, slug)
    if not template
      throw new Error  "No template with slug '#{slug}' in database #{databaseId}; available slugs: #{_.keys(await getTemplates(databaseId)).join ', '}"

    console.log "Found template:\n#{template}"

    { prompt } = template

    # Replace %...% in prompt with prompts with the same slug (recursively, but make sure we don't get stuck in a loop)
    getRefs = ( prompt ) -> prompt.match(/(?<=\%)(\w+)(?=\%)/g) ? []

    replaceRefs = ( prompt, slugsUsed = [ slug ] ) ->

      for reffedSlug in refs = getRefs(prompt)

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
    prompt = prompt.replace /\{\{(\w+)\}\}/g, ( _, key ) ->
      if variables[key]
        variables[key]
      else
        throw new Error "Missing input #{key}" 

    console.log "Prompt after variable substitution:\n#{prompt}"

    Object.assign parameters, { prompt }

    engine ?= 'text-davinci-003'

    url = "https://api.openai.com/v1/engines/#{engine}/completions"

    try

      { data: { choices } } = await axios.post url, parameters,
        headers:
          Authorization: "Bearer #{openAIkey}"
      console.log "Got response from OpenAI: #{JSON.stringify(choices)}"

      choices = choices.map ({ text }) -> text: text.trim()

      # Count the approximate cost of tokens spent: count characters in template + all choices and divide by 4,
      # then multiply by 0.02/1000 if engine contains 'davinci' or 0.002/1000 otherwise (we assume they won't be using ada or babbage)
      characterCount = _.sumBy [ prompt, ..._.map(choices, 'text') ], 'length'
      approximateCost = characterCount / 4 / 1000 * ( if engine.includes 'davinci' then 0.02 else 0.002 )

      res.send {
        choices
        characterCount
        approximateCost
      }

    catch err
      if err.response.status is 401
        res.status(401).send err
      else
        throw err

  catch err
    console.error err
    res.status(500).send err

module.exports =
  path: '/api/polygon'
  handler: app