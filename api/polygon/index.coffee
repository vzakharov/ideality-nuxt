# API server for polygon, a framework for serving and executing GPT-3 prompts

console.log "Starting polygon API server..."

# Imports: express, axios, and vovas-notion
express = require 'express'
axios = require 'axios'
Notion = require('vovas-notion').default
console.log Notion

# Take POLYGON_TOKEN, OPENAI_KEY, and POLYGON_DB_ID from environment variables
{ POLYGON_TOKEN, OPENAI_KEY } = process.env

# Create a new express app
app = express()

# Create a new notion client with env.POLYGON_TOKEN as the token
notion = new Notion(POLYGON_TOKEN)

# Create an axios instance for calls to OpenAI

model = axios.create
  headers:
    Authorization: "Bearer #{OPENAI_KEY}"

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

# Get all slug->id mappings for a database
app.get '/prompt-ids/:databaseId', ({ params: { databaseId }, query = {} }, res) ->

  try

    console.log "Getting prompt IDs... for database #{databaseId}"
    if query
      console.log "Query: #{JSON.stringify(query)}"

    results = await notion.queryDatabase(databaseId, query)
    console.log "Found #{results.length} prompts."

    # Create an object with slugs as keys and ids as values
    idsBySlug = results.reduce ((acc, { slug, raw: { id }}) ->
      acc[slug] = id
      acc
    ), {}

    console.log "Mapping: #{JSON.stringify(idsBySlug)}"

    res.send idsBySlug

  catch err

    console.error err
    res.status(500).send err


# Run a prompt
app.post '/run', ({ body: { promptId: id, engine, parameters = {}, variables = {} } } = {}, res) ->

  try

    console.log "Running prompt #{id} with engine #{engine} and parameters #{parameters} and variables #{variables}"

    { text: prompt } = await notion.getPage(id)

    console.log "Found prompt: #{prompt}"

    # Replace {{...}} in prompt with variables
    # Make sure the key is in the variables object
    prompt = prompt.replace /\{\{(\w+)\}\}/g, ( _, key ) ->
      if variables[key]
        variables[key]
      else
        throw new Error "Missing input #{key}" 
    Object.assign parameters, { prompt }

    url = "https://api.openai.com/v1/engines/#{engine ? 'text-davinci-003'}/completions"

    try
      { data: { choices } } = await model.post url, parameters
      console.log "Got response from OpenAI: #{choices}"
    catch err
      if err.response.status is 401
        res.status(401).send err
      else
        throw err


    res.send {
      choices
    }

  catch err
    console.error err
    res.status(500).send err

module.exports =
  path: '/api/polygon'
  handler: app