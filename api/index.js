const express = require('express')

const axios = require('axios')

const Bubble = require('../plugins/bubble')
const admin = new Bubble.default({ token: 'Bearer ' + process.env.BUBBLE_TOKEN})

const { buildPrompt, complete, parseResponse } = require('../plugins/whispering')
const { keyedPromises } = require('../plugins/helpers')


const app = express()

const _ = require('lodash')
const { assign, forEach, map } = _

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('trust proxy', true)

async function doComplete(
  {
    body: { prompt, n, stop, allowUnsafe, engine, apiKey, temperature }
  },
  res,
  next
) {

  try {

    // Only allow unsafe requests if sent with the user's own api key
    if ( !allowUnsafe && !apiKey ) {
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
            allowUnsafe,
            message: 'Unsafe input, please consider revising.'
          }
        })

    }
    
    return response

  } catch (error) {
    next(error)
  }

}

app.post('/getImage', async (
  {
    body: {
      query, orientation
    }
  },
  res, next
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
    // next(error)
  }
})

app.post('/widget/generate', async ({ body, ip}, res, next) =>
{
  try {

    let { n, input, output, appendInput, duringSetup, exampleIndex, widget, apiKey } = {
      input: '', output: '', n: 1, 
      ...body
    }

    let { id } = widget

    let info = await keyedPromises({
      ip: admin.get('ip', `ip-${ip.replace(/\./g, '-')}`),
      widget: admin.get('widget', id)
    })
    
    if ( !apiKey ) {

      for( let key in info ) {

        let { runsLeft } = info[key]

        console.log({key, runsLeft})
        if ( runsLeft < 0)
          return res.status(403).send({
            error: {
              cause: key == 'ip' ? 'quota' : 'quota_widget',
              message: ( key == 'ip'
                ? 'Quota exceeded. Come back in an hour'
                : 'Widget quota exceeded. Come back tomorrow'
              ) + ' or add “?apiKey=[your OpenAI key]” to the URL to make the request using your own key. (We don’t store your API key and will only use to make a request directly from your browser.)'
            }
          })

      }

    }

    ['slate', 'tie', 'setup', 'runsLeft'].forEach(key =>
      !widget[key] && ( widget[key] = info.widget[key] )
    )

    let { setup, slate, tie } = widget
    let { runsLeft } = info.ip

    let allowUnsafe = !!apiKey || slate.allowUnsafe

    let { prompt, stop, prefix } = buildPrompt({ setup, slate, tie, duringSetup, exampleIndex, input, appendInput, output })
    
    if ( !apiKey ) apiKey = process.env.OPENAI_KEY

    let response = await doComplete(
      {
        body: { prompt, n, stop, allowUnsafe, apiKey},
        ip,
        ignoreQuotaCheck: true
      },
      res,
      next
    )
  
    let content = parseResponse({ input, output, appendInput, prefix, response, n })
    
    let decrement = ( prompt.length + content.output.length ) / 2000

    admin.go('runsLeft--', { ip, widget: widget.id, decrement })//.then(runsLeftResponse => console.log({ runsLeftResponse }))

    res.send({ content, runsLeft })
  } catch(error) {
    try {
      console.log({error})
      let { statusCode, body: {status, message, path }} = error
      return res.status(statusCode).send({
        error: {
          cause: 'bubble_error', 
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
  headers: { referer }, 
  body: { 
    widget: { id }, actor, action
  },
  ip
}, res ) => {

  actor || ( actor = ip )

  admin.post('widgetEvent', { widget: id, actor, action, referer })

  res.send(null)

})

export default {
  path: '/api',
  handler: app
}