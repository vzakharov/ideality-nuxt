import { request } from 'express'

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

const { buildPrompt, complete, parseResponse } = require('../plugins/build')

const jsyaml = require('js-yaml')

const app = express()

// try {

  const _ = require('lodash')
  const { assign, filter, find, get, keys, map, pickBy, reject } = _

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

  // let users = {}

  async function getUser(token, ignoreErrors, next) {
    let user //= users[token]
    // if (!user) {
      try {
        user = await (
          new Bubble.default({ token })
        ).go('getUserInfo')  
      } catch (err) {
        console.log({err})
        // if ( ignoreErrors )
          return undefined
        // else
        //   throw(err)
      } 
      // finally {
      //   next()
      // }
    //   users[token] = user
    //   setTimeout(() => delete users[token], 1000 * 3600 * 24)
    // }
    return user
  }

  app.get('/auth/clear', () => users = {})
  // app.get('/auth/list', (req, res) => res.send(users))

  app.get('/auth/user', async ( {headers: { authorization: token }}, res, next ) => {
    try {
      let user = await getUser(token, null, next)
      // console.log({users})
      res.send({user})
    } catch(err) {
      res.status(403).send(err)
    }
  })

  app.post('/complete', completeWithCheck)

  async function completeWithCheck(
    {
      body: { prompt, n, stop, allowUnsafe, engine, apiKey, temperature },
      ip,
      ignoreQuotaCheck
    },
    res,
    next
  ) {

    try {

      // console.log({ prompt })

      // Check quota
      if ( !ignoreQuotaCheck ) {
        let { ip: { runsLeft }} = await admin.go('runsLeft--', { ip })

        if ( runsLeft <= 0 )
        return res.status(403).send("Quota exceeded; please come back in an hour.")  
      }

      // Only allow unsafe requests if sent with the user's own api key
      if ( !apiKey ) {
        apiKey = process.env.OPENAI_KEY
        allowUnsafe = false
      }

      // Check safety in the background if needed
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
          }, { headers })

      // Prepare request

      let response = await complete({ engine, temperature, prompt, n, stop, apiKey })
      
      if (!allowUnsafe) {

        let { data: { choices: [{ text: safetyLabel }]}} = await safetyChecked

        console.log({ safetyLabel })
        
        if ( safetyLabel.match(/[12]/) )
          return res.status(403).send({
            error: {
              cause: 'unsafe', 
              message: 'Unsafe input, please consider revising.'
            }
          })

      }
      
      // console.log({ response })
      return response

    } catch (error) {
      console.log('error:', error)
      return res.status(500).send({error})
    }

  }

  app.post('/getImage', async (
    {
      body: {
        query, orientation
      }
    },
    res
  ) => {
    try {
      !orientation && ( orientation = 'landscape' )
      console.log({query})
      let { data: {
        photos: [ photo ]
      }} = await axios.get(`https://api.pexels.com/v1/search?query=${query}&orientation=${orientation}&per_page=1`, {
        headers: { Authorization: process.env.PEXELS_KEY }
      })
      // console.log({photo})
      
      return res.send(photo)
    } catch(error) {
      console.log({error})
      return res.status(500).send({error})
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
        !( widget && widget.setup && widget.slate )
        && admin.get('widget', id)
          .then( ({ setup, slate, tie }) => 
            assign(widget, {
              setup: { ...setup, ...widget.setup },
              slate, tie,
              ...widget
            })
          )
      
      let quota = {}

      if ( apiKey || get(widget, 'slate.apiKey') ) {
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
                + ( quotaExceeded == 'ip' ? ' Please come back in an hour.' : '' )
              }
            })
        }
      }

      await widgetLoaded

      let { setup, slate, tie } = widget
      ;( { apiKey } = slate )

      let { prompt, stop, prefix } = buildPrompt({ setup, slate, tie, duringSetup, input, appendInput, output })
      
      let response = await completeWithCheck(
        {
          body: { prompt, n, stop, allowUnsafe, apiKey},
          ip,
          ignoreQuotaCheck: true
        },
        res
      )
    
      console.log('response: ', response.data)

      // console.log({input, output})

      let content = parseResponse({ input, output, appendInput, prefix, response, n })
      
      delete quota.ip
      console.log({content})

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

    res.send(null)

  })

// } catch (err) {
//   console.log(err)
//   // throw(err)
// }

export default {
  path: '/api',
  handler: app
}


