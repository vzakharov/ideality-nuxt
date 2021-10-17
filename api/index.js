const express = require('express')
const axios = require('axios')
const yaml = require('js-yaml')
const { stripIndent } = require('common-tags')

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

    let r = await axios.get('https://ideality.app/version-test/api/1.1/obj/widget/' + id, { headers: {
      'Authorization': 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20'
    }})
  
    let { data: { response: { config, template } } } = r
    config = JSON.parse(config)
    template = JSON.parse(template)
  
    let { context, examples, inputPrefix, outputPrefix } = config
    let { apiKey, instruction } = template

    let prompt = [
      instruction,
      context,
      examples.map(example =>
        `${inputPrefix}:\n${example.input}\n\n${outputPrefix}:${example.output}`
      ).join('\n\n'),
      inputPrefix+':\n'
    ].filter(a=>a).join('\n\n')

    if ( input )
      prompt += `${input}\n\n${outputPrefix}:\n`
  
    console.log(prompt)

    let payload = {
      prompt,
      temperature: 0.75, 
      max_tokens: 200, 
      frequency_penalty: 1,
      presence_penalty: 1,
      n: 1,
      stop: [inputPrefix + ':']
    }
  
    let response = await axios.post(
      'https://api.openai.com/v1/engines/curie-instruct-beta/completions',
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    )
  
    let { text } = response.data.choices[0]
  
    console.log(text)
  
    if ( input ) 
      output = text.trim()
    else
      [input, output] = text.split(outputPrefix+':').map(s=>s.trim())
  
    res.send({input, output})
  } catch(err) {
    next(err)
  }

})


export default {
  path: '/api',
  handler: app
}