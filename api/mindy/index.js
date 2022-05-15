// API server for Mindy, an AI-powered group chat bot

const express = require('express')
const app = express()

// To get ip
app.set('trust proxy', true)

const Notion = require('vovas-notion')
// console.log(Notion)
const notion = new Notion.default()

const _ = require('lodash')

// Endpoint to get chat messages
app.get('/messages', async ( req, res ) => {

  try {

    let messages = await notion.queryDatabase(process.env.MINDY_DATABASE_ID, 
      {
        sorts: [
          {
            property: 'Time',
            direction: 'descending'
          }
        ],
      }, {
        unwrap: {
          user: {}
        }
      }
    )

    messages = messages.reverse()

    console.log('messages:', messages)

    res.send(messages)

  } catch (e) {

    console.log('error', e)
    res.status(500).send(e)

  }

})

// Endpoint to test name

export default {
  path: 'api/mindy',
  handler: app
}