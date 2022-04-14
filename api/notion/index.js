const axios = require('axios')

const express = require('express')
const app = express()

const defaultHeaders = {
  authorization: process.env.NOTION_AUTH,
  'Notion-Version': '2022-02-22'
}

// Generic function to send a request to Notion
async function sendRequest({ 
  params: { endpoint }, 
  headers: { authorization },
  query,
  method,
  body
}, res, next ) {
  console.log({ method, endpoint })
  try {
    method = method.toLowerCase()

    // Non-authenticated requests are only allowed for 'get pages'
    if ( method != 'get' || endpoint != 'pages' ) {
      let { page_id, database_id } = body.parent || {}
      let id = page_id || database_id
      authorization = authorization || `Bearer ${query.token}`

      let idsExposedForPosting = process.env.NOTION_IDS_EXPOSED_FOR_POSTING

      console.log({ id, idsExposedForPosting })

      if ( 
        !idsExposedForPosting.includes(id) &&
        authorization != process.env.NOTION_AUTH
      ) {
        return res.status(403).send("Invalid token or page not exposed for posting")
      }
    }

    let url = 'https://api.notion.com/v1/' + endpoint

    let headers = defaultHeaders

    // send respective axios request depending on method
    let { data } = method == 'get'
      ? await axios.get(url, { headers })
      : await axios[method](url, body, { headers })

    console.log(data)
    res.send(data)  
  } catch(error) {
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

// Generic notion proxy
app.all('/:endpoint(*)', sendRequest)

export default {
  path: 'api/notion',
  handler: app
}