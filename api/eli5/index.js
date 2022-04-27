const axios = require('axios')

const express = require('express')
const app = express()

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

// POST endpoint: take query, send to openai, return response
app.post('/', async ({ body: { query }}, res) => {

  let prompt = `Query: "${query}"\n\nExplain to a five-year-old:`

  try {

    // Run the request and check toxicity at the same time
    let [
      { data: { choices: [{ text }]}},
      toxicity
    ] = await Promise.all([
      axios.post(
        'https://api.openai.com/v1/engines/text-curie-001/completions',
        {
          prompt,
          max_tokens: 100,
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