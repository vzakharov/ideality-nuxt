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

const serverStarted = new Date()
console.log({ serverStarted })

let oldLastMessageTime = null

let routineStarted = null
let routineStopped = null

const onlineUsers = []


// Endpoint to get users online
app.get('/onlineUsers', async (req, res) => 
  res.send(onlineUsers)
)

// Function to nudge a user's last-seen value (i.e. when they make any request)
function nudgeUser({ name, raw: { id } }) {

  console.log('Nudging user:', name)
  console.log('Online users:', onlineUsers)
  let onlineUser = _.find(onlineUsers, { name })
  console.log('User online?', !!onlineUser)

  if ( !onlineUser ) {

    console.log('User not online, adding to onlineUsers')
    postMessage(id, 'joined', { special: true })
    onlineUser = { name, raw: { id } }
    onlineUsers.push(onlineUser)

  }

  onlineUser.lastSeen = new Date()

  console.log('User nudged:', name)
  console.log('Online users:', onlineUsers)

  // If routine is not running, start it
  if ( !routineStarted )
    startRoutine()

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

async function routine() {

  let shouldStop = routineStopped || ( serverStarted > routineStarted )
  // ^^ If routine has been stopped, or if the server has been restarted since the routine started
  console.log({ routineStarted, routineStopped, serverStarted })

  try {


    if ( shouldStop ) {
      console.log('Routine stopped')
      return
    }

    console.log('Running routine...')

    // Purge online users older than 1 minute
    console.log('Purging users online')
    for ( let user of onlineUsers ) {

      if ( Date.now() - user.lastSeen > 60000 ) {
        console.log('Purging user:', user.name)
        onlineUsers.splice(onlineUsers.indexOf(user), 1)
      }
    
    }
    console.log('Online users:', onlineUsers)

    // If no online users, stop routine
    if ( !onlineUsers.length ) {
      shouldStop = true
      stopRoutine()
      return
    }

    // Check messages
    console.log('Checking messages...')
    let messages = await getMessages()
    let lastMessage = _.last(messages)

    // If there are new messages and the last one isn't from the bot
    if ( lastMessage.time != oldLastMessageTime && lastMessage.user.name != botName ) {

      console.log('New messages:', messages)
      await generateReply(messages)

    }

  } catch (e) {

    console.error('Error during routine:', e.response ? e.response.data : e)
    
  } finally {
    
    if ( !shouldStop )
      setTimeout(routine, 5000)    

  }

}

// Function to start the routine
async function startRoutine() {

  routineStarted = new Date()
  routineStopped = null
  console.log({ routineStarted })

  routine()

  return routineStarted

}

// Function to stop the routine
async function stopRoutine() {

  routineStopped = new Date()
  routineStarted = null
  console.log({ routineStopped })

  return routineStopped

}

async function generateReply(messages) {

  console.log('Generating reply, messages:', messages)

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

  while ( !routineStopped ) {

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

// Endpoint to send message
app.post('/messages', auth, async ( { user, body: { content }}, res ) => {

  let message = await postMessage( user.raw.id, content )
  console.log('Message sent:', message)
  res.send(message)

})

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