const axios = require('axios')

const Bubble = require('../plugins/bubble')
const BubbleAdmin = new Bubble.default({ token: 'Bearer ' + process.env.BUBBLE_TOKEN})

const cors = require('cors')

const { buildPrompt, complete, parseResponse } = require('../plugins/whispering')

const { keyedPromises } = require('../plugins/helpers')

const express = require('express')
const { response } = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// To get ip
app.set('trust proxy', true)

app.use(cors())

// Function to run completion (currently OpenAI only; todo: add AI21, Cohere & maybe any other)
async function doComplete(
  {
    body: { prompt, n, stop, allowUnsafe, engine, apiKey, temperature }
  },
  res,
  next
) {

  try {

    // Only allow unsafe requests if sent with the user's own api key
    if ( !apiKey ) {
      apiKey = process.env.OPENAI_KEY
      allowUnsafe = false
    }

    let headers = {
      Authorization: `Bearer ${apiKey}`
    }

    // Check safety in parallel with sending the request, to save on the completion time.

    let safetyChecked = 
      !allowUnsafe && 
        axios.post('https://api.openai.com/v1/engines/content-filter-alpha/completions', {
          prompt: `<|endoftext|>${prompt}\n--\nLabel:`,
          temperature: 0,
          top_p: 0,
          max_tokens: 1,
          logprobs: 10
        }, { headers })

    let response = await complete({ engine, temperature, prompt, n, stop, apiKey })
    
    if (!allowUnsafe) {

      let { data: { choices: [{ text: safetyLabel }]}} = await safetyChecked

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


// Star/unstar a build
app.post('/build/starred', async ({
  ip, body: {
    build: { id: build }, clear
  }
}, res) => {
  let starred = (
    await BubbleAdmin.get('buildStar', { ip, build })
  )[0]

  console.log({starred, clear})
  if ( !!starred == !!clear) {
    if ( clear ) {
      let { id } = starred
      await BubbleAdmin.destroy('buildStar', { id })
    } else {
      await BubbleAdmin.post('buildStar', { ip, build })
    }
  }

  res.send(await BubbleAdmin.go('recountStars', { build }))
})


// Get image from Pexels
// Todo: Add a check that the request actually comes from Ideality
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
    let { data: {
      photos: [ photo ]
    }} = await axios.get(`https://api.pexels.com/v1/search?query=${query}&orientation=${orientation}&per_page=1`, {
      headers: { Authorization: process.env.PEXELS_KEY }
    })    
    return res.send(photo)
  } catch(error) {
    // return res.status(500).send({error})
    next(error)
  }
})

// Endpoint to generate outputs based on widget & input

app.post('/widget/generate', async ({ body, ip}, res, next) =>
{
  try {

    let { n, input, output, appendInput, duringSetup, exampleIndex, widget, apiKey } = {
      input: '', output: '', n: 1, 
      ...body
    }

    let { id } = widget

    let info = await keyedPromises({
      ip: BubbleAdmin.get('ip', `ip-${ip.replace(/\./g, '-')}`),
      widget: BubbleAdmin.get('widget', id)
    })

    console.log({ip, id, info})
    
    if ( !apiKey ) {

      for( let key in info ) {

        let { runsLeft } = info[key] || {}

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

    if ( widget.id ) BubbleAdmin.go('runsLeft--', { ip, widget: widget.id, decrement })

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

// Track widget use

app.post('/widget/track', async ({ 
  headers: { referer }, 
  body: { 
    widget: { id }, actor, action
  },
  ip
}, res ) => {

  actor || ( actor = ip )

  BubbleAdmin.post('widgetEvent', { widget: id, actor, action, referer })

  res.send(null)

})

app.get('/hello', (req, res) => res.send('Hello world'))

app.post('/terminal', async ({
  body: { instruction, secret }
}, res ) => {
  console.log({ instruction, secret })
  if ( secret != process.env.BUBBLE_TOKEN )
    return res.status(403).send("Invalid token")
  try {
    let resolve
    let promise = new Promise(r => resolve = r)
    eval(`;(async () => ${instruction} )().then(resolve);`)
    let result = await promise
    console.log({ result })
    return res.send({ result })
  } catch(error) {
    console.log({error  })
    return res.status(500).send({error})
  }
})

app.post('/proxy',
  async (req, res, next) => {
    try {

      // console.log(req.body)
      let { body, query: { url, key, host }, headers: { authorization } } = req
      let { PROXY_KEY } = process.env 
      if ( key != PROXY_KEY )
        return res.status(403).send("Invalid key")
      
      let request = [
        url, body, {
          headers: {
            authorization,
            accept: '*/*',
            origin: `https://${host}`,
            referer: `https://${host}/`,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
          },
          // httpsAgent: new https.Agent({
          //   rejectUnauthorized: false
          // })
        }
      ]

      // console.log(request)
      let { data } = await axios.post(...request)

      // console.log({ data })
      res.send(data)
    } catch(error) {
      // console.log({error})
      // If it's a http error, forward it to the client
      if ( error.response ) {
        let { status, statusText, data } = error.response
        console.log(error.response)
        res.status(status).send({ status, statusText, data })
      } else {
        console.log({error})
        next(error)
      }
    }
  }
)

// Endpoint that returns a top-up link from Smartcat using amount and currency index as input
app.get('/topup-link', async ({ query: { amount, currency } }, res ) => {

  let link

  async function getAndSendLink(link) {

    console.log('Getting top-up link')
    link = (
      await axios.post(
        'https://smartcat.com/api/balance/topupRequest',
        { amount, currency },
        // Use SMARTCAT_COOKIE
        {
          headers: {
            cookie: SMARTCAT_COOKIE
          }
        }
      )
    ).data.iframeUrl
    console.log('Got top-up link:', link)

    res.send({ link })
    return link

  }

  try {

    await getAndSendLink()
  
  } catch(error) {
    console.log({error})
    
    // If it's a 403, try signing in and getting the link again
    if ( error.response && error.response.status == 403 ) {

      try {

        await signInToSmartcat()
        await setSmartcatAccount()
        await getAndSendLink()

      } catch(error) {

        console.log({error})
        res.status(500).send({error})

      }

    } else {
      res.status(500).send({error})
    }

  }



})

let { SMARTCAT_COOKIE } = process.env

// function to sign in to Smartcat
async function signInToSmartcat() {

  let { SMARTCAT_EMAIL: email, SMARTCAT_PASSWORD: password } = process.env
  console.log('Signing in to Smartcat', { email, password })

  let response = await axios.post(
    'https://smartcat.com/api/auth/signInUser',
    { 
      email, password,
      userPersonalAccount: false,
      backURL: '/workspace',
      rememberMe: true
    }
  )

  // Take set-cookie header and save it to SMARTCAT_COOKIE
  let { headers: { 'set-cookie': cookies }} = response
  // Extract everything before the first semicolon
  console.log({ cookie: cookies })
  SMARTCAT_COOKIE = cookies[1].split(';')[0]
  console.log('Set SMARTCAT_COOKIE', { SMARTCAT_COOKIE })

  return SMARTCAT_COOKIE

}

// function to set Smartcat account
async function setSmartcatAccount() {

  let { SMARTCAT_ACCOUNT_ID } = process.env
  console.log('Setting Smartcat account', { SMARTCAT_ACCOUNT_ID })
  let response = await axios.post(
    `https://smartcat.com/api/Account/Change?accountId=${SMARTCAT_ACCOUNT_ID}`,
    null,
    // cookie
    { headers: { cookie: SMARTCAT_COOKIE } }
  )
  return response.data

}

export default {
  path: '/api',
  handler: app
}