const express = require('express')
const axios = require('axios')
const yaml = require('js-yaml')
const { stripIndent } = require('common-tags')
const { parse } = JSON
const { canRunWidget } = require ('../plugins/helpers')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/test', function (req, res) {
  res.send('Test successful')
})

const baseURL = 'https://ideality.app/version-test/api/1.1/'

const backendAdmin = axios.create({ 
  baseURL,
  headers: {'Authorization': 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20'} 
})

app.post('/widget/generate', async (req, res, next) =>
{
  try {
    let { id, input } = req.body
    let output

    console.log(id, req.headers)
  
    let backend = axios.create({baseURL, headers: {Authorization: req.headers.authorization}})

    let [
      { data: { response: { user }}},
      { data: { response: { setup, template }}}
    ] = await Promise.all([
      backend.post('wf/getUserInfo/'),
      backendAdmin.get('obj/widget/' + id)
    ])
    
    if ( !canRunWidget(user) )
      return res.status(403).send({ error: {
        cause: 'dailyLimit', 
        message: `Too many widget runs; please try again after ${new Date(user['Created Date'] + 24*3600).toUTCString()}`
      }})
    else
      backend.post('wf/incWidgetRuns')

    setup = parse(setup)
    let { context, examples } = setup

    template = parse(template)  
    let { apiKey, instruction, inputPrefix, outputPrefix } = template

    let prompt = [
      instruction,
      context,
      examples.map(example =>
        `${inputPrefix}:\n${example.input}\n\n${outputPrefix}:\n${example.output}`
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