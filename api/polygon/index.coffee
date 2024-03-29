# API server for polygon, a framework for serving and executing GPT-3 templates
log = (...args) ->
  console.log ...args
  args[args.length - 1]

log "Starting polygon API server..."

# Imports: express, axios, and vovas-notion
express = require 'express'
axios = require 'axios'
Notion = require('vovas-notion').default
_ = require 'lodash'
# log Notion

{ POLYGON_TOKEN, NODE_ENV, OPENAI_KEY, MIXPANEL_TOKEN } = process.env
SECRET = POLYGON_TOKEN.slice(-8)

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

{ default: GPT3Tokenizer } = require 'gpt3-tokenizer'
log GPT3Tokenizer
tokenizer = new GPT3Tokenizer type: 'gpt3'

Vue = require 'vue'
renderer = require('vue-server-renderer').createRenderer()
{ parse } = require 'node-html-parser'

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

  # console.log "Getting template #{slug} for database #{databaseId}..."
  {[ slug ]: template} = await getTemplates(databaseId)
  template

# Create a get prompt endpoint that requires an 8-character "secret" as a query parameter and checks it against SECRET
app.get '/prompt/:databaseId/:slug', ({ params: { databaseId, slug }, query: { html, secret } }, res) ->

  try

    if secret != SECRET
      return res.status(401).send "Invalid token"
    
    { prompt } = await getTemplate(databaseId, slug)

    if html isnt undefined
      prompt = prompt.replace /\n/g, '<br>'

    res.send prompt

  catch err

    console.error err
    res.status(500).send err

# Clear all cached templates (takes a secret as a query parameter, same as above)
app.get '/clear-cache', ({ query: { secret } }, res) ->

  if secret != SECRET
    return res.status(401).send "Invalid token"

  templatesBySlug = {}
  res.send "Cleared cache."

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
app.post '/upvote', ({ body: { generationId, databaseId = 'd688be53d62145f6b880639d49cc706f'}, res }) ->
# TODO: move databaseId to env var

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

  replaceVariables = ( text, variables ) ->
    text.replace /\{\{([\w-]+)(\?)?\}\}/g, ( _, key, optional ) ->
      if variable = variables[key]
        # if object, stringify
        if typeof variable is 'object'
          JSON.stringify variable
        else
          variable
      else
        if optional
          ''
        else
          throw new Error "Missing input #{key}" 

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

  # Replace {{...}} in template with variables. Optional variables are formatted as {{var?}}.
  log "Prompt after variable substitution:",
  prompt = replaceVariables prompt, variables

makePromptFromVueTemplate = ({ prompt, variables }) ->

  # Replace all `<(if|for|else-if) .*?>` with <span v-...="..."> to make Vue happy
  # Also replace <else> with <span v-else> and all respective closing tags
  # Also remove all indentation
  # Also replace empty lines with <br/> to turn them into line breaks once we do innerText
  prompt = prompt
    .replace /<(if|for|else-if)\s+(.*?)>/g, '<span v-$1="$2">'
    .replace /<else>/g, '<span v-else>'
    .replace /<\/(if|for|else-if|else)>/g, '</span>'
    .replace /^\s+/gm, ''
    .replace /^\s*$/gm, '<br/>'
  
  # log "Vue template:\n#{prompt}"

  # log "rendered HTML:",
  html = await renderer.renderToString new Vue
    data: -> {
      ...variables
      seedsUsed: []
    }
    methods:
      json: (value) -> if value then JSON.stringify value else ''
      # randomSeed: -> @json({seed: _.random(100, 999)})
      randomSeed: ->
        loop
          seed = _.random(100, 999)
          if not @seedsUsed.includes seed
            @seedsUsed.push seed
            return @json({seed})
    template: "<div style=\"white-space: pre-wrap;\">#{prompt}</div>"

  log "Rendered prompt:\n",
  _.unescape (parse html).innerText.trim()

waitUntilByKeyHash = {}

# Run a template
app.post '/run', run = ({ ip, body, body: { template, openAIkey, openaiKey, databaseId, slug, parameters: { engine, ...parameters }, feeder = '', variables = {} } } = {}, res) ->

  try

    if openAIkey
      openaiKey = openAIkey
      # (For backwards compatibility)
      
    # If no openaiKey is provided, return a 401
    if not openaiKey
      throw new Error "Missing OpenAI key"
    
    console.log {arguments}

    keyHash = crypto.createHash('sha256').update(openaiKey).digest('hex')

    mixpanelParams = {
      environment: NODE_ENV
      ip
      n: parameters.n ? 1
      # Sha of openaiKey as distinct_id
      distinct_id: keyHash
      keyHash
      slug
      databaseId
      engine
      ...parameters
      # If no slug, use hash of template
      ...( if slug then {} else
        templateHash: crypto.createHash('sha256').update(template).digest('hex')
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

    { outputFormat, promptFormat, prompt } = template

    prompt = await if promptFormat is 'vue'
      makePromptFromVueTemplate { prompt, variables }
    else
      makePrompt { template, variables, slug, databaseId }
    
    prompt += feeder

    engine ?= 'gpt-3.5-turbo-instruct'

    Object.assign parameters, { prompt, model: engine }

    # If max_tokens is set and the number of tokens in prompt + max_tokens is greater than 4000 (2000 for curie), reduce max_tokens to stay below 4000 (2000)
    promptTokens = tokenizer.encode(prompt).bpe.length
    tokenLimit = if engine?.includes 'curie' then 2000 else 4000
    if parameters.max_tokens and parameters.max_tokens + promptTokens > tokenLimit
      parameters.max_tokens = tokenLimit - tokenizer.encode(prompt).bpe.length
      console.warn "Reduced max_tokens to #{parameters.max_tokens} to stay below #{tokenLimit} tokens"

    url = "https://api.openai.com/v1/completions"

    try

      # Wait until waitUntilByKeyHash[keyHash] (which is a timestamp)
      if waitUntilByKeyHash[keyHash]
        timeToWait = waitUntilByKeyHash[keyHash] - Date.now()
        if timeToWait > 0          
          console.log "Waiting for #{timeToWait}ms before sending request to OpenAI"
          await new Promise (resolve) -> setTimeout resolve, timeToWait
          console.log "Done waiting"
        delete waitUntilByKeyHash[keyHash]


      { data: { choices } } = await axios.post url, parameters,
        headers:
          Authorization: "Bearer #{openaiKey}"
      log "Got response from OpenAI", choices

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
          # console.log "Removed request #{generation.id} from generations: #{JSON.stringify(generation)}"
        , 24 * 60 * 60 * 1000
      
        # console.log "Added request #{generation.id} to generations: #{JSON.stringify(generation)}"

        text: text.trim()
        generationId: generation.id
        finishReason: finish_reason

      log 'Token count',
      tokenCount = _.sumBy [ prompt, ..._.map(choices, 'text') ], (text) -> log tokenizer.encode(text).bpe.length

      # An API key is allowed 250000 tokens per minute, i.e. ~4000 tokens per second, so we'll wait 0.25 seconds for every 1000 tokens, or 0.25 milliseconds per token next time we use this key
      # waitUntilByKeyHash[keyHash] = Date.now() + tokenCount * 0.25
      # Seems like openAI is taking into account max_tokens instead of the actual number of tokens, so we'll just wait 0.25 seconds for every 1000 max_tokens (plus promptTokens)
      waitUntilByKeyHash[keyHash] = Date.now() + ( ( parameters.max_tokens || 10 ) + promptTokens ) * 0.25

      log 'Cost',
      approximateCost = Math.round( tokenCount / 1000 * ( if engine.includes 'davinci' then 0.02 else 0.002 ) * 1e7 ) / 1e7
      
      if outputFormat is 'json'

        parseAsJson = ( text, feeder ) ->    
          text = feeder + text if feeder
          # text = text.replace /\n/g, '\\n'
          do tryParse = ( text ) ->
            # log 'Trying', text
            for suffix in [ '', '}', ']}' ]
              # log '...with suffix', suffix
              if ( object = try JSON.parse text + suffix )
                return log "Parsed JSON", object
            if text.length
              tryParse text.slice 0, -1
            else
              throw new Error "Could not parse generated text: #{text}"

        # choices = choices.map (choice) -> {
        choices = choices.map ({ text, ...choice }) ->
          text = text.slice 0, -1
          # Convert \n to \\n
          text = text.replace /\n/g, '\\n'
          {
            ...(parseAsJson text, feeder),
            _meta: choice
          }          

      mixpanel.track 'completed', {
        ...mixpanelParams,
        generationIds: _.map(choices, 'generationId').join ','
        finishReasons: _.map(choices, 'finishReason').join ','
        tokenCount
        approximateCost
      }, -> console.log "Tracked completed", ...arguments
      
      output = {
        choices
        tokenCount
        approximateCost
      }
      
      res?.send output

      log 'Output',
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
app.post '/generate', generate = ({ ip, body: { openAIkey, openaiKey, parameters, descriptor, outputKeys, returns, optionalReturns, input, specs, examples, retries = 2 } = {} }, res) ->

  try

    if openAIkey
      openaiKey = openAIkey
      # (For backwards compatibility)

    if outputKeys
      returns = outputKeys
      # (For backwards compatibility)

    log "Running generate with parameters #{JSON.stringify(parameters)}, returns #{returns}, input #{JSON.stringify(input)}"

    databaseId = '068baa7841324cc682aa3eb7cad4bd8c'
    # TODO: Move this to environment variable
    slug = 'generate-v2'

    if not returns
      { returns } = specs

    # If output is a string, convert to array
    returns = if _.isString returns
      [ returns ]
    else if _.isObject(returns)
      if _.isArray returns
        returns
      else
        _.keys returns

    returns = returns.map _.camelCase
    feeder = "{\"#{returns[0]}"

    { n } = parameters || {}
    # If n is defined, we will be returning an array, even if n is 1
    returnArray = n isnt undefined
    n ||= 1

    choices = []
    approximateCost = 0
    tokenCount = 0

    retries = 5 if retries > 5
    # (Just to be safe)

    for attempt in [ 1 .. retries+1 ]

      if attempt > 1
        log "Retrying (attempt #{attempt})"

      variables = {
        returns
        descriptor
        input
        specs
        examples
      }

      try
        # log 'Got output:',
        output = await run {
          ip
          body: {
            openaiKey
            databaseId
            slug
            parameters: {
              # max_tokens: 3000
              max_tokens: 500
              stop: ["\n>", "\n\n"]
              ...parameters
            }
            variables
            feeder
          }
        }
      catch err
        # If 429 or 503, try again after a second
        if err.response?.status in [ 429, 503 ] and attempt <= retries
          log "Got #{err.response.status} error, retrying in 1 second"
          log "Error details:", err.response.data
          await new Promise (resolve) -> setTimeout resolve, 1000
          continue
        else
          throw err

      log 'Required returns',
      requiredReturns = if optionalReturns == true
        []
      else
        _.difference returns, ( optionalReturns or [] )
      # Remove choices that don't have all the required returns
      output.choices = output.choices.filter (choice) ->
        log "Checking if #{JSON.stringify choice} has all the required returns",
        _.every requiredReturns, (key) ->
          log "Checking if #{key} is in the choice",
          choice[key] isnt undefined

      choices.push ...output.choices
      approximateCost += output.approximateCost
      tokenCount += output.tokenCount

      if choices.length >= Math.min(n, 2)
        break
      
      # If it was the last attempt, and not even one choice has all the output keys, throw an error
      if attempt is retries+1 and choices.length is 0
        throw new Error "Could not generate an output with all the output keys (#{requiredReturns.join ', '}). If you want to make some of these keys optional, send them as an array of strings in the `optionalReturns` parameter."
      
      log "Not enough choices (#{choices.length} < #{n}), retrying (attempt #{attempt})"

    if not returnArray
      { _meta: { generationId, finishReason }, ...data } = choices[0]
      res.send { ...data, _meta: {
        approximateCost, tokenCount, generationId,
        incomplete: finishReason is 'length' or undefined
      } }
    else
      res.send { choices, approximateCost, tokenCount }

  
  catch err

    # If it's an http error, log it and send it to the client
    if err.response
      console.error err.response.status, err.response.data
      res.status(err.response.status).send { openaiError: err.response.data?.error }
    else
      console.error err
      res.status(500).send err.message or err

app.post '/generate/:descriptor', ({ params: { descriptor }, ...req }, ...args) ->
  log "Running generate for #{descriptor}..."
  generate { ...req, body: { ...req.body, descriptor } }, ...args

# Enable methods via GET (only for DEV environment) using env.OPENAI_KEY. Variables are taken directly from the query string.

if NODE_ENV is 'development'

  app.get '/run/:databaseId/:slug', ({ params: { databaseId, slug }, query: { parameters = "{}", ...query } }, res) ->
    console.log "Running template #{slug} for database #{databaseId} with variables #{JSON.stringify(query)} and parameters #{parameters}..." 
    run
      body: {
        openaiKey: OPENAI_KEY
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
        openaiKey: OPENAI_KEY
        what: what.split ','
        for: [ firstArg, query ]
        parameters: JSON.parse parameters
      }
      res

module.exports =
  path: '/api/polygon'
  handler: app