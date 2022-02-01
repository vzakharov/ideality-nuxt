import { filter, find, forEach, kebabCase, isObject, pick, get, keys, map, mapValues, values } from 'lodash'
import Bubble from '../plugins/bubble'

function appendedTarget({ route, params, query, hash, reset, ...newRoute }) {
  route = route || this?.route || {}
  reset = reset || {}
  return {
    ...route,
    query: { ...reset.query ? {} : route.query, ...query },
    params: { ...reset.params ? {} : route.params, ...params },
    hash: reset.hash ? '' : hash || route.hash,
    ...newRoute
  }
}

let always = what => () => what

function filteredParameters({setup, slate, tie, onlyRecitals, duringGeneration}) {
  let { parameters } = slate || tie
  if ( !parameters )
    return []
  let { parameterValues } = setup
  return parameters.filter(({ name, requires, regex, recital }) => {
    if ( onlyRecitals && !recital )
      return false
    let value = parameterValues[name]
    let requiredParameterValue = parameterValues[requires]
    return (
      value || !duringGeneration
    ) && (
      !requires || ( 
        !regex && requiredParameterValue
      ) || (
        requiredParameterValue && requiredParameterValue.match(new RegExp(regex))
      )
    )
  })  
}

async function getUser({ $axios, $auth } = this) {
  try {
    let user = await (
      new Bubble({$auth, token: $auth.strategy.token.get()}).go('getUserInfo')
    )
    console.log({user})
    $auth.setUser(user)
    return user
  } catch(error) {
    // debugger
    console.log({error})
    $auth.setUser(null)
    return null
  }
}


async function keyedPromises(promises) {

  let objectKeys = keys(promises)

  let object = {}
  forEach(await Promise.all(values(promises)), 
    ( value, i ) => object[ objectKeys[i] ] = value
  )

  return object

}

async function loggedInMiddleware({ store: { state: { auth: { loggedIn }}}, redirect, route: { fullPath } }) {
  if ( loggedIn )
    await getUser(...arguments)
  else
    return redirect({name: 'login', query: { then: fullPath }})
}

function objectify(array, value = {} ) {
  return Object.assign(
    array.length > 1 ? objectify(array.slice(1), value) : {},
    { [array[0]]: value }
  )
}

let timestamp = Date.now()

function ms(message, reset) {

  if ( reset ) {
    timestamp = Date.now()
    console.log(message)
  } else {
    console.log(message, `${Date.now() - timestamp} ms`)
    timestamp = Date.now()
  }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function slugify(name, items) {
  let slug = kebabCase(name)
  let i = 1
  while (find(items, { slug })) {
    slug = [kebabCase(name), i++].join('-')
  }
  return slug
}

export {

  appendedTarget,
  always,
  filteredParameters,
  getUser,
  keyedPromises,
  loggedInMiddleware,
  ms,
  objectify,
  sleep,
  slugify,

}