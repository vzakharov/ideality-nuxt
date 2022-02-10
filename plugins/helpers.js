import { assign, filter, find, forEach, kebabCase, isObject, omit, pick, get, keys, map, mapValues, multiply, reduce, values } from 'lodash'
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

function objectify(array, initialize ) {
  let key = array[0]
  return assign(
    array.length > 1 ? objectify(array.slice(1), initialize) : {},
    { [key]: initialize?.(key) || {} }
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

function assignProperties(object, properties) {
  Object.defineProperties(object, mapValues( properties, value => ({
    configurable: true,
    ...typeof value == 'function' 
      ? { get: value } 
      : { writeable: false, value } 
  })
  ))
}

function assignMethods(object, methods) {
  Object.defineProperties(object, mapValues( methods, method => ({
    configurable: true,
    value: method
  })))
}

function Awaitable() {

  assign(this, {
    pending: false,
    done: Promise.resolve(),
    end: () => {},

    start() {
      this.pending = true
      this.done = new Promise(resolve => 
        this.end = result => {
          this.pending = false
          resolve(result)
        }
      )
    },

    async waitAndStart() {
      while ( this.pending ) {
        await this.done
      } 
      this.start()
    }

  })

}

function Internalize(propName, subKeys = keys(propName), { computed, methods } = {}) {

  return {

    created() {

      let prop = this[propName]

      for ( let key of subKeys ) {
        if ( !prop[key] ) {
          Object.defineProperty(prop, key, {
            configurable: true,
            set: value => {
              delete prop[key]
              this.$set(prop, key, value)
            }
          })
        }
      }

      computed && assignProperties(this[propName], {
        ...mapValues( computed, 
          ( value, key ) => () =>  this[key],
        ),
        ...omit(this.$props, propName)
      })

      methods && assignMethods(this[propName], 
        methods
      )

    },

    computed: {

      ...objectify(subKeys, key => ({

        get() { 
          return this[propName][key] 
        },

        set(value) {
          this.$set(this[propName], key, value)
        }

      })),
      
      ...computed

    }

  }

}

export {

  appendedTarget,
  always,
  assignMethods,
  assignProperties,
  Awaitable,
  filteredParameters,
  getUser,
  Internalize,
  keyedPromises,
  loggedInMiddleware,
  ms,
  objectify,
  sleep,
  slugify,

}