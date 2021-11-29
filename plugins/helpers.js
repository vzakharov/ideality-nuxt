import { filter, isObject, pick, get, keys } from 'lodash'
// import Bubble from '@/plugins/bubble'

function canRunWidget({code, apiKey, widget} = this) {
  return true
}

function cast(f, ...targets) {
  return function() {
    return f(...targets, ...arguments)
  }
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
    let { data: { user }} = await $axios.get('api/auth/user')
    $auth.setUser(user)
  } catch(error) {
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


export {

  canRunWidget,
  cast,
  filteredParameters,
  getUser,
  isDefined,
  parseKids

}