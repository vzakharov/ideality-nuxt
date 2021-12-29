const express = require('express')

const axios = require('axios')

const Bubble = require('../plugins/bubble')
const admin = new Bubble.default({ token: 'Bearer ' + process.env.BUBBLE_TOKEN})

const { buildPrompt, complete, parseResponse } = require('../plugins/whispering')

const app = express()

const _ = require('lodash')
const { assign, map } = _

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

    // Start loading the widget, but check the quota in the meantime
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
    
    let runsLeft = {}

    let allowUnsafe = !!apiKey 
    if ( !apiKey ) {
      let ipInfo = await admin.get('ip', `ip-${ip.replace(/\./g, '-')}`) || {}
      console.log({ ipInfo })
      runsLeft.ip = ipInfo.runsLeft
      if ( runsLeft.ip < 0 ) {
        return res.status(403).send({
          error: {
            cause: 'quota', 
            message: 'Quota exceeded. Please come back in an hour or add “?apiKey=[your OpenAI key]” to the URL to make the request using your own key. (We don’t store your API key and will only use to make a request directly from your browser.)'
          }
        })
      }
      apiKey = process.env.OPENAI_KEY
    }

    await widgetLoaded

    runsLeft.widget = widget.runsLeft

    if ( runsLeft.widget < 0 ) {
      return res.status(403).send({
        error: {
          cause: 'widget_quota', 
          message: 'Widget quota exceeded. Please come back next day or add “?apiKey=[your OpenAI key]” to the URL to make the request using your own key. (We don’t store your API key and will only use to make a request directly from your browser.)'
        }
      })
    }

    let { setup, slate, tie } = widget

    allowUnsafe = allowUnsafe || slate.allowUnsafe

    let { prompt, stop, prefix } = buildPrompt({ setup, slate, tie, duringSetup, exampleIndex, input, appendInput, output })
    
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

app.post('/error', async (req, res, next) => {
  try {
    await Bubble.default.anon.go('nope')
  } catch(error) {
    console.log({error})
    res.status(403).send(error)
  }
})

app.post('/widget/track', async ({ 
  headers: { referer }, 
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


