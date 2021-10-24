const express = require('express')
const axios = require('axios')
const yaml = require('js-yaml')
const { stripIndent } = require('common-tags')
const { parse } = JSON
const { canRunWidget, filteredParameters } = require ('../plugins/helpers')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('trust proxy', true)


app.get('/test', function (req, res) {
  res.send(req.ip)
})

// const log = thing => {
//   console.log(thing)
//   return thing
// }

// axios.interceptors.request.use(log, log)
// axios.interceptors.response.use(log, log)

const baseURL = 'https://ideality.app/version-test/api/1.1/'

const backendAdmin = axios.create({ 
  baseURL,
  headers: {'Authorization': 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20'} 
})

app.post('/widget/generate', async (req, res, next) =>
{
  try {
    console.log(req.body)
    let { id, input, output, appendInput, duringSetup, widget } = {
      input: '', output: '',
      ...req.body
    }

    console.log(id, req.headers)
    if ( !widget || !widget.setup || !widget.template ) {
      let backend = axios.create({baseURL, headers: {Authorization: req.headers.authorization}})

      let [
        { data: { response: { user }}},
        { data: { response }}
      ] = await Promise.all([
        backend.post('wf/getUserInfo'),
        backendAdmin.get('obj/widget/' + id)
      ])

      if ( !canRunWidget(user) )
        return res.status(403).send({ error: {
          cause: 'dailyLimit', 
          message: `Too many widget runs; please try again after ${new Date(user['Created Date'] + 24*3600).toUTCString()}`
        }})
      else
        backend.post('wf/incWidgetRuns')
      
      console.log(response)
      ;['setup', 'template'].forEach(what =>
        !widget[what] && (
          widget[what] = parse(response[what])
        )
      )
    }

    let { setup, template } = widget
    let { parameterValues, examples } = setup
    let { apiKey, instruction, inputPrefix, outputPrefix } = template

    if ( duringSetup )
      examples.pop()


    console.log(setup, template)

    let prompt = [
      instruction,
      filteredParameters({setup, template, onlyRecitals: true, duringGeneration: true}).map(({ name }) =>
        `${name}:\n${parameterValues[name]}`
      ).join('\n\n'),
      examples.map(example =>
        `${inputPrefix}:\n${example.input}\n\n${outputPrefix}:\n${example.output}`
      ).join('\n\n'),
      inputPrefix+':\n'
    ].filter(a=>a).join('\n\n')

    if ( input )
      prompt += input
      
    if ( input && !appendInput || output)
      prompt += `\n\n${outputPrefix}:\n${output}`
  
    console.log(prompt)

    let payload = {
      prompt,
      temperature: 0.75, 
      max_tokens: 200, 
      frequency_penalty: 1,
      presence_penalty: 1,
      n: 1,
      stop: [inputPrefix + ':', ...examples.length ? [] : ['\n']]
    }
  
    console.log(payload)

    let response = await axios.post(
      'https://api.openai.com/v1/engines/curie-instruct-beta/completions',
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    )
  
    console.log(response.data)
    let { text } = response.data.choices[0]
  
    console.log(text)
  
    if ( input && !appendInput ) 
      output += text.trimEnd()
    else {
      [input, output] = (input + text).trimEnd().split(outputPrefix+':').map(s=>s.trim())
      if ( !output )
        [input] = input.split("\n")
    }
  
    res.send({input, output})
  } catch(err) {
    console.log(err)
    next(err)
  }

})


export default {
  path: '/api',
  handler: app
}