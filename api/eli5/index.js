const axios = require('axios')

const express = require('express')
const app = express()

// To get ip
app.set('trust proxy', true)

const headers = {
  Authorization: `Bearer ${process.env.OPENAI_KEY}`,
}

async function getToxicity(query) {

  let prompt = `<|endoftext|>${query}\n--\nLabel:`

  try {

    let { data: { choices: [{ text: toxicity }]}} = await axios.post(
      'https://api.openai.com/v1/engines/content-filter-alpha/completions',
      {
        prompt: `<|endoftext|>${prompt}\n--\nLabel:`,
        temperature: 0,
        top_p: 0,
        max_tokens: 1,
        logprobs: 10
      },
      {
        headers
      }
    )

    // Convert safety label to number
    return Number(toxicity.trim())

  } catch (error) {
    
    console.error(error)

    return 2

  }

}

let requestsWithinLastHour = process.env.ELI5_INITIAL_NUM_REQUESTS || 0

// Remove one request every 36 seconds
setInterval(() => {
  if (requestsWithinLastHour > 0) {
    requestsWithinLastHour--
    console.log('Requests within last hour DOWN to ' + requestsWithinLastHour)
  }
}, 36000)

// POST endpoint: take query, send to openai, return response
app.post('/', async ({ body: { query }}, res) => {

  // If there were more than 100 requests within the last hour, return a 503 error with a message
  if ( requestsWithinLastHour > 100 ) {
    return res.status(503).send({
      error: 'Too many requests within the last hour, please come back later.'
    })
  }

  // Push current time to requestsWithinLastHour
  requestsWithinLastHour++
  console.log('Requests within last hour UP to ' + requestsWithinLastHour)

  let prompt = `Query: "${query}"\n\nExplain to a five-year-old:`

  try {

    // Run the request and check toxicity at the same time
    let [
      { choices: [{ text, finish_reason }]},
      toxicity
    ] = await Promise.all([
      complete(prompt),
      getToxicity(query)
    ])

    // If toxicity > 1, send an error response
    if ( toxicity > 1 ) {
      return res.status(400).send({
        error: 'Sorry, your request was deemed inappropriate.'
      })
    }

    // If finish_reason is other than 'stop', complete again, using prompt+text as the prompt, and append the response text to the original text. Use text-curie-001 engine.
    if ( finish_reason != 'stop' ) {
      // console.log({ text, finish_reason })
      let { 
        choices: [{ text: appendix }]
      } = await complete(prompt + text, 'text-curie-001')
      // console.log({ appendix })
      text += appendix
    }


    let response = text.trim()

    return res.send({
      response
    })

  } catch (error) {
      
      console.error(error)
      return res.status(500).send({
        error: 'Sorry, there was an error processing your request.'
      })

  }


  async function complete(prompt, engine='text-davinci-002') {
    let { data } = await axios.post(
      `https://api.openai.com/v1/engines/${engine}/completions`,
      {
        prompt,
        max_tokens: 150,
        temperature: 0,
        n: 1,
        frequency_penalty: 1.5,
        presence_penalty: 1.5
      },
      {
        headers
      }
    )
    console.log(prompt, engine, data )
    return data
  }

})

export default {
  path: 'api/eli5',
  handler: app
}