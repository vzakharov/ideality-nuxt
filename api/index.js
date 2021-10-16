const express = require('express')
const axios = require('axios')
const yaml = require('js-yaml')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/test', function (req, res) {
  res.send('Test successful')
})

app.post('/widget/generate', async (req, res, next) =>
{
  try {
    let { id, input } = req.body
    let output
  
    console.log({id, input})
    let r = await axios.get('https://ideality.app/version-test/api/1.1/obj/widget/' + id)
    console.log(r)
  
    let { data: { response: { config } } } = r
    config = JSON.parse(config)
  
    console.log(config)
  
    let prompt = [
      config.instruction,
      config.context,
      config.examples.map(example => [
        "Input:\n" + example.input,
        "Output:\n" + example.output
      ].join("\n\n")),
      "Input:"
    ].filter(s=>s).join("\n\n")
  
    if ( input )
      prompt += "\n" +input + "\n\nOutput:"
  
    let payload = {
      prompt,
      temperature: 0.75, 
      max_tokens: 200, 
      frequency_penalty: 1,
      presence_penalty: 1,
      n: 1,
      stop: ["Input:"]
    }
  
    let response = await axios.post(
      'https://api.openai.com/v1/engines/curie-instruct-beta/completions',
      payload,
      {
        headers: {
          Authorization: `Bearer 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`
        }
      }
    )
  
    let { text } = response.data.choices[0]
  
    console.log(text)
  
    if ( input ) 
      output = text.trim()
    else {
      input = text.match(/[^\n]+/)[0].trim()
      output = text.match(/(?<=Output:\n)[\s\S]*?(?=\n\n|$)/)[0].trim()
    } 
  
    res.send({input, output})
  } catch(err) {
    next(err)
  }

})


export default {
  path: '/api',
  handler: app
}