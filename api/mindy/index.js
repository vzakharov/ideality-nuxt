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

const onlineUsers = []

// Endpoint to get users online
app.get('/onlineUsers', async (req, res) => 
  res.send(onlineUsers)
)

// Function to nudge a user's last-seen value (i.e. when they make any request)
function nudgeUser({ name, raw: { id } }) {

  console.log('Nudging user:', name)
  let onlineUser = _.find(onlineUsers, { name })
  // console.log('User online?', !!onlineUser)

  if ( !onlineUser ) {

    console.log('User wasn\'t online, adding to onlineUsers')

    // Check if this user's last message was "left" (special). If yes, post "joined" message
    getMessages().then(messages => {

      let message = _(messages).filter({ user: { name } }).reverse().first()
      console.log('User\'s last message:', message.content)
      if ( message && message.content === 'left' && message.special ) {
        console.log('User\'s last message was "left", posting "joined" message')
        postMessage(id, 'joined', { special: true })
      }

    })

    onlineUser = { name, raw: { id } }
    onlineUsers.push(onlineUser)

  }

  let lastSeen = new Date()
  onlineUser.lastSeen = lastSeen

  // console.log('User nudged:', name)

  clearTimeout(onlineUser.timeout)

  // Remove from onlineUsers in a minute
  onlineUser.timeout = setTimeout(() => {

    console.log('User timed out:', name)
    onlineUsers.splice(onlineUsers.indexOf(onlineUser), 1)
    postMessage(id, 'left', { special: true })
    
  }, 60000)

}

// Log every request
app.use((req, res, next) => {
  console.log(req.ip, req.method, req.url)
  next()
})

// Endpoint to get chat messages
app.get('/messages', allowUnauthorized, auth, async ( req, res ) => {

  try {

    let messages = await getMessages()

    // console.log('messages:', messages)
    if ( req.user ) {

      nudgeUser(req.user)

    }

    if ( generatingReply )
      console.log('Returning messages while generating reply')

    res.send({ messages, generatingReply })

  } catch (e) {

    console.error('error:', e)
    res.status(500).send(e)

  }

})

let lastChecked = null        // When the bot last checked for new messages
let lastMessageTime = null    // When the last message was posted the last time it was checked
let generatingReply = false   // Whether the bot is currently generating a reply

// Endpoint to post message
app.post('/postMessage', auth, async ( { user, body: { content }}, res ) => {

  let message = await postMessage( user.raw.id, content )
  console.log('Message sent:', message)

  // If the last check was more than five seconds ago, check for new messages
  if ( !lastChecked || (new Date() - lastChecked) > 5000 ) {
    lastChecked = new Date()
    console.log('Checking for new messages')
    getMessages().then(messages => {

      let message = _.last(messages)
      if ( message.time != lastMessageTime && message.user.name != botName && !generatingReply ) {
        console.log('New message:', message)
        lastMessageTime = message.time
        generateReply(messages)
      }

    })
  }

  res.send(message)

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

async function generateReply(messages) {

  if ( generatingReply )
    throw new Error('Already generating reply')

  generatingReply = true

  console.log('Generating reply; last message:', _.last(messages))

  let prompt = messages.map(
    ({
      user: { name }, content, special
    }) => 
      special ? 
        `${name} ${content}` 
        : `${name}: ${content}`
  ).join('\n') + `\n${botName}:`

  console.log('input:\n', prompt)

  let engine = 'text-davinci-002'

  while ( true ) {

    try {

      let { data } = await axios.post(
        `https://api.openai.com/v1/engines/${engine}/completions`, {
          prompt,
          temperature: 0.5,
          max_tokens: 100
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`
          },
          timeout: 5000
        }
      )

      let { choices: [{ text }] } = data

      console.log('text:', text)

      // Make sure that the second line doesn't start with the bot name (to avoid multiline replies)
      let lines = text.trim().split('\n')
      if ( lines.length > 1 && lines[1].startsWith(botName) )
        continue
      
      // Remove all lines but the first one
      text = lines[0].trim()

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

    } finally {
      
      generatingReply = false

    }

  }

}

async function postMessage( id, content, { special } = {} ) {

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
      content,
      special
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

// Allow unauthorized middleware
async function allowUnauthorized(req, res, next) {
  req.allowUnauthorized = true
  next()
}

// Authentication middleware
async function auth(req, res, next) {

  try {
    
    let { headers: { authorization }, allowUnauthorized } = req

    if ( !authorization && !allowUnauthorized ) {

      return res.status(401).send("No authorization header")

    } else {

      let user

      if ( authorization ) {

        let [ prefix, token ] = authorization.split(' ')

        if ( prefix != 'Bearer' )
          return res.status(401).send("Authorization header must start with 'Bearer'")

        if ( !token )
          return res.status(401).send("No token in authorization header")

        user = await getUserByToken(token, { includeRaw: true })

        if ( !user || user.hash != createHash(token) )
          return res.status(401).send("Invalid token or no user found")

        console.log('User authenticated:', user.name)

      }
    
      _.assign(req, { user })
      next()

    }

  } catch (err) {

    console.error(err)
    res.status(500).send(err)

  }

}

// Endpoint to get current user
app.get('/me', auth, ( { user }, res ) => {

  res.send(user)

})


// Endpoint to create a user
app.post('/users', async ( {  body: { name } }, res ) => {

  let user = await getUserByName(name)

  if ( user )     
    return res.status(409).send("User already exists")

  let token = 'mindy-'+crypto.randomBytes(32).toString('hex')
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