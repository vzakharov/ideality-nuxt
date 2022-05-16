// API server for Mindy, an AI-powered group chat bot

const botName = process.env.MINDY_BOT_NAME
const botId = process.env.MINDY_BOT_ID

const axios = require('axios')

const crypto = require('crypto')

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

    let messages = await getMessages()

    console.log('messages:', messages)

    res.send(messages)

  } catch (e) {

    console.error('error:', e)
    res.status(500).send(e)

  }

})

async function getMessages() {
  let messages = await notion.queryDatabase(
    process.env.MINDY_CHAT_DB_ID, {
      sorts: [
        {
          property: 'Time',
          direction: 'descending'
        }
      ]
    }, {
      unwrap: {
        user: {}
      }
    }
  )

  messages = messages.reverse()
  return messages
}

let oldLastMessageTime = null
let messageCheckStarted = null
let messageCheckStopped = null

// Endpoint to start an interval to get messages every 5 seconds
app.get('/start', async ( { headers: { authorization } }, res ) => {

  // if ( authorization != process.env.NOTION_AUTH ) {
  //   return res.status(403).send("Invalid token")
  // }
  // TODO: change to post and check token

  let alreadyDone = messageCheckStarted

  if ( !messageCheckStarted ) {

    messageCheckStarted = new Date()
    messageCheckStopped = null

    const checkMessages = async () => {

      try {

        if ( messageCheckStopped ) {
          console.log('Message check stopped')
          return
        }

        console.log('Checking messages...')
        let messages = await getMessages()
        let lastMessage = _.last(messages)
        // If no new messages or if the last one is from the bot, return
        if (lastMessage.time == oldLastMessageTime || lastMessage.user.name == botName)
          return

        console.log('New messages:', messages)

        await generateReply(messages)

      } catch (e) {
        console.log('error', e)
      } finally {
        
        if ( !messageCheckStopped )
          process.nextTick(() => {
            console.log('Will check again in 5 seconds...')
            setTimeout(checkMessages, 5000)
          })

      }

    }

    checkMessages()

  }

  res.send({ messageCheckStarted, alreadyDone })

})

// Endpoint to stop the interval
app.get('/stop', async ( { headers: { authorization } }, res ) => {

  // if ( authorization != process.env.NOTION_AUTH ) {
  //   return res.status(403).send("Invalid token")
  // }
  // TODO: change to post and check token

  console.log('Stopping message check...')
  let alreadyDone = messageCheckStopped

  if ( !messageCheckStopped ) {
    messageCheckStopped = new Date()
    messageCheckStarted = null
  }

  res.send({ messageCheckStopped, alreadyDone })

})

async function generateReply(messages) {

  console.log('Generating reply, messages:', messages)

  let input = messages.map(
    ({
      user: { name }, content, special
    }) => 
      special ? 
        `${name} ${special}` 
        : `${name}: ${content}`
  ).join('\n') + `\n${botName}:`

  console.log('input:\n', input)

  let instruction = 'Reply as mindy (the bot), trying to be as helpful as possible'
  let engine = 'text-davinci-edit-001'

  while ( !messageCheckStopped ) {

    try {

      let { data } = await axios.post(
        `https://api.openai.com/v1/engines/${engine}/edits`, {
          input,
          instruction,
          temperature: 0.5
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`
          },
          timeout: 5000
        }
      )
      console.log('data:', data)

      let { choices: [{ text }] } = data

      console.log('text:', text)
    
      // First, check that the reply text fully contains the input in the beginning. If not, try again
      if ( !text.startsWith(input) )
        continue

      // Remove the input from the reply text
      text = text.substring(input.length).trim()

      console.log('text after removing input:', text)

      // Make sure that the second line doesn't start with the bot name (to avoid multiline replies)
      let lines = text.split('\n')
      if ( lines.length > 1 && lines[1].startsWith(botName) )
        continue
      
      // Remove all lines but the first one
      text = lines[0]

      console.log('text after removing multiline:', text)

      // Make sure that the reply isn't longer than a tweet
      if ( text.length > 280 )
        continue
      
      console.log('Bot reply:', text)

      // Send the reply to the database
      await postMessage( botId, text )

      break

    } catch (e) {

      console.error('Error while generating reply:', e)

      // If it's ECONNABORTED or ETIMEDOUT, try again
      let { code } = e
      if ( [ 'ECONNABORTED', 'ETIMEDOUT' ].includes(code) )
        continue

      throw e

    }

  }

}

async function postMessage( id, content ) {

  let time = Date.now().toString()

  await notion.createPage( {
    parent: {
      database_id: process.env.MINDY_CHAT_DB_ID
    },
    properties: {
      time,
      user: {
        relation: [{
          id
        }]
      },
      content
    },
    titleProp: 'time'
  } )

}

async function getUserByName(userName, { includeRaw } = {}) {

  let [ user ] = await notion.queryDatabase(
    process.env.MINDY_USERS_DB_ID, {
      filter: {
        property: 'Name',
        title: {
          equals: userName
        }
      }
    }
  ) || []

  if ( user && !includeRaw )
    user = _.omit(user, 'raw')  

  return user
  
}

// Endpoint to get user by name (no authorization needed)
app.get('/u/:name/:action', async ( { params: { name, action } }, res ) => {

  let user = await getUserByName(name)
  if ( !user ) {
    if ( action == 'check' ) {
      res.send({ available: true })
    } else {
      res.status(404).send("User not found")
    }
  } else
    res.send(user)

})

const createHash = password => crypto.createHmac('sha256', process.env.MINDY_SALT).update(password).digest('hex')

async function getUserByToken(token) {

  let [ user ] = await notion.queryDatabase(
    process.env.MINDY_USERS_DB_ID, {
      filter: {
        property: 'Hash',
        title: {
          equals: createHash(token)
        }
      }
    }
  )

  return user

}

// Authentication middleware
async function auth({ headers: { authorization } }, res, next) {

  try {

    if ( !authorization ) {

      return res.status(401).send("No authorization header")

    } else {

      let [ prefix, token ] = authorization.split(' ')

      if ( prefix != 'Bearer' ) 
        return res.status(401).send("Authorization header must start with 'Bearer'")

      if ( !token )
        return res.status(401).send("No token in authorization header")

      let user = await getUserByToken(token, { includeRaw: true })

      if ( !user || user.hash != createHash(token) )
        return res.status(401).send("Invalid token or no user found")

      console.log('User authenticated:', user)
    
      _.assign(res.locals, { user })
      next()

    }

  } catch (err) {

    console.error(err)
    res.status(500).send(err)

  }

}

// Endpoint to send message
app.post('/messages', auth, async ( { body: { content }}, res ) => {

  let { user: { raw: { id } } } = res.locals
  let message = await postMessage( id, content )
  res.send(message)

})



// Endpoint to create a user
app.post('/users', async ( {  body: { name } }, res ) => {

  let user = await getUserByName(name)

  if ( user )     
    return res.status(409).send("User already exists")

  let token = crypto.randomBytes(32).toString('hex')
  console.log('token:', token)

  user = await notion.createPage( {
    parent: {
      database_id: process.env.MINDY_USERS_DB_ID
    },
    properties: {
      name,
      hash: createHash(token)
    }
  } )

  console.log('Created user:', user)

  return res.send(token)

})

export default {
  path: 'api/mindy',
  handler: app
}