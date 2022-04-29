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

let requestsWithinLastHour = []

// POST endpoint: take query, send to openai, return response
app.post('/', async ({ body: { query }}, res) => {

  // Push current time to requestsWithinLastHour
  let timeObject = { time: Date.now() }
  requestsWithinLastHour.push(timeObject)
  console.log('New request, total requests:', requestsWithinLastHour.length)
  // Set a timeout to remove the time object from requestsWithinLastHour
  setTimeout(() => {
    requestsWithinLastHour.splice(requestsWithinLastHour.indexOf(timeObject), 1)
    console.log('Request removed, total requests:', requestsWithinLastHour.length)
  }, 3600000)
  // If there were more than 100 requests within the last hour, return a 503 error with a message
  if ( requestsWithinLastHour.length > 100 ) {
    return res.status(503).send('Too many requests within the last hour, please come back later.')
  }

  let prompt = `Query: "${query}"\n\nExplain to a five-year-old:`

  try {

    // Run the request and check toxicity at the same time
    let [
      { data: { choices: [{ text }]}},
      toxicity
    ] = await Promise.all([
      axios.post(
        'https://api.openai.com/v1/engines/text-davinci-002/completions',
        {
          prompt,
          max_tokens: 150,
          temperature: 0,
          n: 1,
          frequency_penalty: 1.5,
          presence_penalty: 1.5,
        },
        {
          headers
        }
      ),
      getToxicity(query)
    ])

    // If toxicity > 1, send an error response
    if ( toxicity > 1 ) {
      return res.status(400).send({
        error: 'Sorry, your request was deemed inappropriate.'
      })
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

})

export default {
  path: 'api/eli5',
  handler: app
}