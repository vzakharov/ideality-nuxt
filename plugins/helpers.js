import { filter, find, kebabCase, isObject, pick, get, keys } from 'lodash'
import Bubble from '../plugins/bubble'

function canRunWidget({code, apiKey, widget} = this) {
  return true
}

function cast(f, ...targets) {
  return function() {
    return f(...targets, ...arguments)
  }
}

function clone(object) {
  return JSON.parse(JSON.stringify(object))
}

function isDefined(what) {
  return typeof what !== 'undefined'
}

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

async function getUser({ $axios, $auth }) {
  try {
  //   let { data: { user }} = await $axios.get('api/auth/user')
    console.log('Fetching user...')
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
  }
}

function parseKids(parent, keys) {
  console.log(parent, keys)
  keys.forEach(key => {
    let kid = parent[key]
    if (kid)
      parent[key] = JSON.parse(kid)
  })
  return parent
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

  canRunWidget,
  cast,
  clone,
  filteredParameters,
  getUser,
  isDefined,
  parseKids,
  slugify

}