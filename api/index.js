const express = require('express')


const axios = require('axios')
const yaml = require('js-yaml')
const { stripIndent } = require('common-tags')
const { parse } = JSON
const { filteredParameters } = require('../plugins/helpers')
// console.log(filteredParameters)
const ipInt = require('ip-to-int')

const Bubble = require('../plugins/bubble')
const admin = new Bubble.default({ token: 'Bearer ' + process.env.BUBBLE_TOKEN})
// const { default: { admin }} = Bubble

const jsyaml = require('js-yaml')

const app = express()

try {

  const _ = require('lodash')
  const { assign, filter, find, get, keys, map, pickBy } = _

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.set('trust proxy', true)

  // const log = thing => {
  //   console.log(thing)
  //   return thing
  // }

  // axios.interceptors.request.use(log, log)
  // axios.interceptors.response.use(log, log)

  const baseURL = process.env.NUXT_ENV_BUBBLE_URL
  // console.log({baseURL})

  const getIpInfo = ip => admin.get('/obj/ip', { params: {
      constraints: [{
        key: 'int',
        constraint_type: 'equals',
        value: ipInt(ip).toInt()
      }]
    }}).then(data => data.response.info)

  const log = what => ( console.log(what), what )

  app.get('/test', function (req, res) {
    res.send(req.ip)
  })
    
  app.post('/democode', async (req, res) => {
    
  })

  let users = {}

  async function getUser(token, ignoreErrors) {
    let user = users[token]
    if (!user) {
      try {
        user = await (
          new Bubble.default({ token })
        ).go('getUserInfo')  
      } catch (err) {
        if ( ignoreErrors )
          return undefined
        else
          throw(err)
      }
      users[token] = user
      setTimeout(() => delete users[token], 1000 * 3600 * 24)
    }
    return user
  }

  app.get('/auth/clear', () => users = {})
  // app.get('/auth/list', (req, res) => res.send(users))

  app.get('/auth/user', async ( {headers: { authorization: token }}, res, next ) => {
    try {
      let user = await getUser(token)
      // console.log({users})
      res.send({user})
    } catch(err) {
      res.status(403).send(err)
    }
  })

  app.post('/widget/generate', async (req, res, next) =>
  {
    // console.log(req)
    try {

      // console.log(req.ip)
      // console.log(req.body)
      let { n, input, output, appendInput, duringSetup, widget, apiKey, code, pr0n: allowUnsafe, fake_ip } = {
        input: '', output: '', n: 1, 
        ...req.body
      }

      let ip = req.ip || fake_ip      

      let { id } = widget

      const widgetLoaded = 
        !( widget && widget.setup && widget.template )
        && admin.get('widget', id)
          .then( ({ setup, template, tie }) => 
            assign(widget, {
              setup: { ...setup, ...widget.setup },
              template, tie,
              ...widget
            })
          )
      
      let quota = {}

      if ( apiKey || get(widget, 'template.apiKey') ) {
        allowUnsafe = true
      }
      else {
        quota = await admin.go('runsLeft--', { ip, widget: widget.id })
        console.log({quota})
        let quotaExceeded = keys(
          pickBy(
            quota, item => 
            item.runsLeft <= 0
          )
        )[0]
        console.log({quotaExceeded})
        if ( quotaExceeded ) {
          let { authorization } = req.headers
          let user = await
            authorization ?
              getUser(authorization) :
              {}
          let { owner } = quota
          console.log({quota, quotaExceeded, user, code})
          if ( !(
            quotaExceeded == 'ip' && (
              user.id == owner.id
              || code && ( code == owner.code )
            )
          ))
            return res.status(403).send({
              error: {
                cause: 'quota', 
                message: ({
                  ip: 'User',
                  widget: 'Widget',
                  owner: 'Widget owner'
                })[quotaExceeded] + ' quota exceeded.'
              }
            })
        }
      }

      await widgetLoaded
      let { setup, template, tie } = widget
      ;( { apiKey } = template )
      let { parameterValues, examples } = setup
      let { instruction, inputPrefix, outputPrefix, omitExamples } = {...template, ...tie}
      let { parameters } = template

      let prefix = {}
      
      for ( let useAs of ['input', 'output'] ) {
        let parameter = find(parameters, { useAs })
        if ( parameter )
          prefix[useAs] = parameterValues[parameter.name].replace(/^(an?|the) /,'').toUpperCase()
        else
          prefix[useAs] = template[useAs + 'Prefix']
      }

      // console.log({prefix})

      if ( duringSetup )
        examples.pop()

      // console.log(setup, template)

      let prompt = [
        instruction,
        filteredParameters({setup, template, onlyRecitals: true, duringGeneration: true}).map(({ name }) =>
          `${name}:\n${parameterValues[name]}`
        ).join('\n\n'),
        (examples || []).map(example =>
          `${prefix.input}:\n- ${example.input}\n\n${prefix.output}:\n${example.output}`
        ).join('\n\n'),
        prefix.input+':\n-'
      ].filter(a=>a).join('\n\n')

      for ( let { name } of _.reject(parameters, { recital: true })) {
        prompt = prompt.replace(`<${name}>`, parameterValues[name])
      }

      if ( input )
        prompt += ' ' + input
        
      if ( input && !appendInput || output)
        prompt += `\n\n${prefix.output}:\n${output}`
    
      console.log(prompt)

      let stop = [
        prefix.input + ':', 
        ...(examples && examples.length) || omitExamples ? [] : ['\n'],
        ...template.stop || []
      ]

      let payload = {
        prompt,
        temperature: 0.75, 
        max_tokens: 200, 
        frequency_penalty: 1,
        presence_penalty: 1,
        n,
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

      // console.log({safetyChecked})

      let engine = template.engine || 'curie-instruct-beta'
      let response = await axios.post(
        `https://api.openai.com/v1/engines/${engine}/completions`,
        payload, {headers}
      )
      
      if (!allowUnsafe) {
        let { data: { choices: [{ text: safetyLabel }]}} = await safetyChecked
        
        console.log({safetyLabel})
    
        if ( safetyLabel.match(/[12]/) )
          return res.status(403).send({
            error: {
              cause: 'unsafe', 
              message: 'Unsafe input'
            }
          })
    
      }
    
      console.log(response.data)

      // console.log({input, output})

      let starting = { input, output }
      function process(choice) {

        let { input, output } = starting

        let { text } = choice
    
        // console.log(text)
      
        if ( input && !appendInput ) 
          output += text.trimEnd()
        else {
          [input, output] = (input + text).trimEnd().split(prefix.output+':').map(s=>s.trim())
          if ( !output )
            [input] = input.split("\n")
        }
  
        if ( output ) {
          output = output.trim()
          output = output.replace(/\n\n.*/, '')
        }

        return { input, output }

      }

      let { choices } = response.data
      let content = 
        n == 1 ?
          process(choices[0])
          : choices.map(choice => process(choice))
      
      delete quota.ip

      res.send({content, runsLeft: map(quota, 'runsLeft') })
    } catch(error) {
      try {
        let { statusCode, body: {status, message, path }} = error
        return res.status(statusCode).send({
          error: {
            cause: 'bubbleError', 
            status,
            message,
            path
          }
        })  
      } catch(err) {
        let { message, stack } = error
        return res.status(500).send({error: { message, stack }})
      }
    }

  })

  app.post('/widget/track', async ({ 
    headers: { authorization, referer }, 
    body: { 
      widget: { id }, actor, action
    },
    ip
  }, res, next) => {

    actor || ( actor = ip )

    admin.post('widgetEvent', { widget: id, actor, action, referer })
      .catch(next)
      .then(({ id }) => res.send({ event: { id }}))

  })

} catch (err) {
  console.log(err)
}

export default {
  path: '/api',
  handler: app
}
