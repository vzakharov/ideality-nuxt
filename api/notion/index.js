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
  body,
  allowAnyway
}, res ) {
  console.log({ method, endpoint })
  try {
    method = method.toLowerCase()
    authorization = authorization || `Bearer ${query.token}`

    // If authorization is not same as env and allowAnyway is not set, return 403
    if ( authorization != process.env.NOTION_AUTH && !allowAnyway )
      return res.status(403).send("Invalid token")

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

const idsExposedForPosting = process.env.NOTION_IDS_EXPOSED_FOR_POSTING?.split(',')

// Endpoint to create a page in a database
app.post('/pages', async (req, res ) => {
  let { page_id, database_id } = req.body.parent
  let id = page_id || database_id

  return sendRequest({
    allowAnyway: idsExposedForPosting.includes(id),
    ...req
  }, res)
})

// Generic notion proxy
app.all('/:endpoint(*)', sendRequest)

export default {
  path: 'api/notion',
  handler: app
}