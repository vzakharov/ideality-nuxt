import { filter, find, forEach, kebabCase, isObject, pick, get, keys, map, mapValues, values } from 'lodash'
import Bubble from '../plugins/bubble'


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


async function keyedPromises(promises) {

  let objectKeys = keys(promises)

  let object = {}
  forEach(await Promise.all(values(promises)), 
    ( value, i ) => object[ objectKeys[i] ] = value
  )

  return object

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

  filteredParameters,
  getUser,
  keyedPromises,
  sleep,
  slugify

}