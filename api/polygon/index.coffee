# API server for polygon, a framework for serving and executing GPT-3 prompts

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
notion = new Notion(POLYGON_TOKEN)

# Create an axios instance for calls to OpenAI

# Health check endpoint
app.get '/health', ( req, res ) => res.send 'ok'

# Get prompt by ID
app.get '/prompt/:id', ({ params: { id } }, res) ->

  try

    console.log "Getting prompt #{id}..."
    { text } = await notion.getPage(id)
    console.log "Got prompt #{id}."
    res.send text

  catch err
    console.error err
    res.status(500).send err

promptsBySlug = {}

# Get all slug->id mappings for a database
app.get '/prompt-ids/:databaseId', ({ params: { databaseId }, query: { reload }}, res) ->

  try

    console.log "Getting prompt IDs... for database #{databaseId}"

    if reload or not promptsBySlug[databaseId]
      console.log "Reloading prompts..."

      results = await notion.queryDatabase(databaseId, {})
      console.log "Found #{results.length} prompts."

      promptsBySlug[databaseId] = _(results)
        .map ({ slug, raw: { id }, ...properties }) -> [ slug, { id, ...properties } ]
        .fromPairs()
        .value()
      
      console.log "Found prompts: #{JSON.stringify(promptsBySlug[databaseId])}"
    
    idsBySlug = _.mapValues promptsBySlug, 'id'

    console.log "Mapping: #{JSON.stringify(idsBySlug)}"

    res.send idsBySlug

  catch err

    console.error err
    res.status(500).send err


# Run a prompt
app.post '/run', ({ body: { openAIkey, databaseId, slug, promptId: id, engine, parameters = {}, variables = {} } } = {}, res) ->

  try

    # If no openAIkey is provided, return a 401
    if not openAIkey
      res.status(401).send "Missing OpenAI key"

    console.log "Running prompt #{id} with engine #{engine} and parameters #{JSON.stringify(parameters)} and variables #{JSON.stringify(variables)}..."

    # If no prompt ID is provided, get the prompt ID from the slug
    if not id
      if slug
        # Make sure databaseId is provided, otherwise we can't get the prompt ID
        if not databaseId
          res.status(400).send "Missing body parameter databaseId"
        # Make sure we have the prompt IDs for the database
        id = promptsBySlug[databaseId][slug].id
        if not id
          res.status(400).send "No prompt with slug #{slug} in database #{databaseId}"
      else
        res.status(400).send "Missing body parameter promptId or slug"

    { text: prompt } = await notion.getPage(id)

    console.log "Found prompt:\n#{prompt}"

    # Replace %...% in prompt with prompts with the same slug (recursively, but make sure we don't get stuck in a loop)
    replaceSlugs = ( prompt, slugsUsed = [] ) ->

      prompt.replace /%(\w+)%/g, ( _, subSlug ) ->

        console.log "Replacing %#{subSlug}% in prompt '#{slug}'..."

        # Make sure databaseId is provided, otherwise we can't get the prompt ID for a referenced prompt
        if not databaseId
          throw new Error "Missing body parameter databaseId (required for referenced prompts)"

        if slugsUsed.includes subSlug
          throw new Error "Circular reference in prompts: #{slugsUsed.join ' -> '} -> #{subSlug}"
        
        { text } = await notion.getPage promptsBySlug[databaseId][subSlug].id

        referencedPrompt = replaceSlugs text, [ ...slugsUsed, subSlug ]

    if prompt.match /%(\w+)%/
      prompt = replaceSlugs prompt
      console.log "Prompt after slug replacement:\n#{prompt}"

    # Replace {{...}} in prompt with variables
    # Make sure the key is in the variables object
    prompt = prompt.replace /\{\{(\w+)\}\}/g, ( _, key ) ->
      if variables[key]
        variables[key]
      else
        throw new Error "Missing input #{key}" 

    Object.assign parameters, { prompt }
    console.log "Prompt after variable substitution:\n#{prompt}"

    engine ?= 'text-davinci-003'

    url = "https://api.openai.com/v1/engines/#{engine}/completions"

    try

      { data: { choices } } = await axios.post url, parameters,
        headers:
          Authorization: "Bearer #{openAIkey}"
      console.log "Got response from OpenAI: #{JSON.stringify(choices)}"

      choices = choices.map ({ text }) -> text: text.trim()

      # Count the approximate cost of tokens spent: count characters in prompt + all choices and divide by 4,
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