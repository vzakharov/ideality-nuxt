// API server for Mindy, an AI-powered group chat bot

const botName = "mindy"

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
          console.log('message check stopped')
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
  ).join('\n')

  console.log('input:', input)

  let instruction = 'Reply as mindy (the bot), trying to be as h  elpful as possible'
  let engine = 'text-davinci-edit-001'

  while ( true ) {

    let { data } = await axios.post(
      `https://api.openai.com/v1/engines/${engine}/edits`, {
        input,
        instruction,
        temperature: 0.5
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_KEY}`
        }
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

    // console.log('text after removing input:', text)

    // Make sure that the text starts with the bot name and a colon
    if ( !text.startsWith(`${botName}:`) )
      continue

    // Make sure that the second line doesn't start with the bot name (to avoid multiline replies)
    let lines = text.split('\n')
    if ( lines.length > 1 && lines[1].startsWith(botName) )
      continue
    
    // Remove all lines but the first one
    text = lines[0]

    // console.log('text after removing multiline:', text)

    // Remove the bot name and colon from the reply text
    text = text.substring(botName.length + 1).trim()

    // console.log('text after removing bot name:', text)

    // Make sure that the reply isn't longer than a tweet
    if ( text.length > 280 )
      continue
    
    console.log('Bot reply:', text)

    // Send the reply to the database
    await postMessage( botName, text )

    break

  }

}

async function postMessage( userName, content ) {

  let time = Date.now().toString()
  let user = await getUserByName(userName)

  await notion.createPage( {
    parent: {
      database_id: process.env.MINDY_CHAT_DB_ID
    },
    properties: {
      time,
      user: {
        relation: [{
          id: user.raw.id
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

// Create or login a user
app.post('/u/:name/', async ( { params: { name }, body: { password } }, res ) => {

  let user = await getUserByName(name)
  console.log('user:', user)

  const reject = () => res.status(403).send("Invalid password or username")
  const createHash = password => crypto.createHmac('sha256', process.env.MINDY_SALT).update(password).digest('hex')

  if ( user ) {

    // Create a hash of the password
    let hash = createHash(password)

    // Check if the hash matches the stored hash
    if ( user.hash != hash ) {
      return reject()
    }

    return res.send(user)

  } else {

    // Generate a random password
    
    password = crypto.randomBytes(32).toString('hex')
    console.log('Generated password:', password)

    user = await notion.createPage( {
      parent: {
        database_id: process.env.MINDY_USERS_DB_ID
      },
      properties: {
        name,
        hash: createHash(password)
      }
    } )

    res.send({
      user,
      password
    })

  }

})

export default {
  path: 'api/mindy',
  handler: app
}