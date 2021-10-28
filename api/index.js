const demoTemplate = {
  parameters: [
    {
      type: "text",
      name: "Product",
      recital: true, 
      multiline: true
    }
  ],
  apiKey: "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",
  instruction:
`Suggest ideas on how to use various products based on various user bios.

Product:
a productivity app with tasks, lists, schedules, etc.

User bio:
I’m juggling freelance work, grad school classes, and a social life.

How this user could use the product:
• Create lists of task assignments, and useful resources for students
• Schedule meetings with clients so that you can keep your mind clear
• Plan games for your next get-together or party
• Use a timer to keep your focus when working on a large project`,
  inputPrefix: "User bio",
  outputPrefix: "How this user could use the product",
  omitExamples: true,
  stop: ['Product']
}

const express = require('express')
const axios = require('axios')
const yaml = require('js-yaml')
const { stripIndent } = require('common-tags')
const { parse } = JSON
const { filteredParameters } = require('../plugins/helpers')
// console.log(filteredParameters)
const _ = require('lodash')
const ipInt = require('ip-to-int')
const Bubble = require('../plugins/bubble')

const app = express()

const { assign, get } = _

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('trust proxy', true)

// const log = thing => {
//   console.log(thing)
//   return thing
// }

// axios.interceptors.request.use(log, log)
// axios.interceptors.response.use(log, log)

const baseURL = 'https://b.ideality.app/api/1.1/'

const admin = axios.create({ 
  baseURL,
  headers: {'Authorization': 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20'} 
})


const getIpInfo = ip => admin.get('/obj/ip', { params: {
    constraints: [{
      key: 'int',
      constraint_type: 'equals',
      value: ipInt(ip).toInt()
    }]
  }}).then(data => data.response.info)


app.get('/test', function (req, res) {
  res.send(req.ip)
})
  

app.post('/widget/generate', async (req, res, next) =>
{
  try {
    // console.log(req.ip)
    // console.log(req.body)
    let { input, output, appendInput, duringSetup, widget, apiKey, iddqd: godMode, pr0n, code } = {
      input: '', output: '',
      ...req.body
    }

    let allowUnsafe = godMode || pr0n

    let { id } = widget

    let isDemo = id=='demo'
    if ( isDemo ) {
      widget.template = demoTemplate
      code = '1635431643111x338474208627258500'
    }
    
    const widgetLoaded = 
      !( widget && widget.setup && widget.template )
      && Bubble.default.admin.get('widget', id)
        .then( ({ setup, template }) => 
          assign(widget, {
            setup, template,
            ...widget
          })
        )
    
    let runsLeft
    if ( isDemo || !apiKey && !get(widget, 'template.apiKey') ) {
      if ( 
        !godMode 
        && !(
          runsLeft = ( 
            await Bubble.default.admin.go('runsLeft--', {code}) 
          ).runsLeft 
        )
      ) {
        return res.status(403).send({
          error: {
            cause: 'apiKeyNotSet', 
            message: 'Please send your OpenAI apiKey as an apiKey parameter in the request body.'
          }
        })
      }
    } else {
      allowUnsafe = true
    }

    await widgetLoaded
    let { setup, template } = widget
    ;( { apiKey } = template )
    let { parameterValues, examples } = setup
    let { instruction, inputPrefix, outputPrefix, omitExamples } = template

    if ( duringSetup )
      examples.pop()

    // console.log(setup, template)

    let prompt = [
      instruction,
      filteredParameters({setup, template, onlyRecitals: true, duringGeneration: true}).map(({ name }) =>
        `${name}:\n${parameterValues[name]}`
      ).join('\n\n'),
      (examples || []).map(example =>
        `${inputPrefix}:\n${example.input}\n\n${outputPrefix}:\n${example.output}`
      ).join('\n\n'),
      inputPrefix+':\n'
    ].filter(a=>a).join('\n\n')

    if ( input )
      prompt += input
      
    if ( input && !appendInput || output)
      prompt += `\n\n${outputPrefix}:\n${output}`
  
    // console.log(prompt)

    let stop = [
      inputPrefix + ':', 
      ...(examples && examples.length) || omitExamples ? [] : ['\n'],
      ...template.stop || []
    ]

    let payload = {
      prompt,
      temperature: 0.75, 
      max_tokens: 200, 
      frequency_penalty: 1,
      presence_penalty: 1,
      n: 1,
      stop
    }
  
    console.log(payload)

    let headers = {
      Authorization: `Bearer ${apiKey}`
    }

    let safetyChecked = 
      !allowUnsafe && 
      axios.post('https://api.openai.com/v1/engines/content-filter-alpha/completions', {
        prompt: `<|endoftext|>${prompt}\n--\nLabel:`,
        temperature: 0,
        top_p: 0,
        max_tokens: 1,
        logprobs: 10
      }, {headers})

    let engine = template.engine || 'curie-instruct-beta'
    let response = await axios.post(
      `https://api.openai.com/v1/engines/${engine}/completions`,
      payload, {headers}
    )
    
    if (!allowUnsafe) {
      let { data: { choices: [{ text: safetyLabel }]}} = await safetyChecked
      
      console.log(safetyLabel)
  
      if ( safetyLabel.match(/[12]/) )
        return res.status(403).send({
          error: {
            cause: 'holdOnYourHorses', 
            message: 'OpenAI thinks that’s an “unsafe” request, so no luck today ¯\\\_(ツ)\_/¯. '+
              'To disable request filtering, use your own API key — **at your own risk!**'
          }
        })
  
    }
  
    console.log(response.data)
    let { text } = response.data.choices[0]
  
    // console.log(text)
  
    if ( input && !appendInput ) 
      output += text.trimEnd()
    else {
      [input, output] = (input + text).trimEnd().split(outputPrefix+':').map(s=>s.trim())
      if ( !output )
        [input] = input.split("\n")
    }
  
    res.send({content: {input, output}, runsLeft })
  } catch(err) {
    console.log(err)
    next(err)
  }

})


export default {
  path: '/api',
  handler: app
}