import { 
  assign, filter, find, findIndex, forEach, kebabCase, indexOf, isArray, isObject, 
  omit, pick, get, keys, map, mapValues, multiply, reduce, slice, values 
} from 'lodash'

import { plural } from 'pluralize'
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
  console.log('getting user...')
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

function Awaitable(immediate) {

  assign(this, {
    idle: true,
    pending: undefined,
    resolved: undefined,
    promise: Promise.resolve(),
    resolve: () => {},

    start() {
      assign(this, {
        idle: false,
        pending: true,
        resolved: false
      })
      this.promise = new Promise(resolve => 
        this.resolve = result => {
          assign(this, {
            idle: false,
            pending: false,
            resolved: true
          })
          resolve(result)
        }
      )
    },

    async waitAndStart() {
      while ( this.pending ) {
        await this.promise
      } 
      this.start()
    }

  })

  immediate && this.start()

}


function Meta( name, { computed, methods, defaults } = {} ) {

  return {

    created() {

      const object = this[name]

      defaults && this.setDefaults(object, defaults)

      computed && assignProperties(object, {
        ...mapValues( computed, 
          ( value, key ) => () =>  this[key],
        ),
        ...omit(this.$props, name)
      })

      methods && assignMethods(object, 
        methods
      )

      object.meta?.resolve()

    },

    computed: {

      ...mapValues(defaults, ( value, key ) => ({

        get() { 
          // console.log('getting', key, this[name][key])
          return this[name][key] 
        },

        // set(value) {
        //   console.log('setting', key, value)
        //   this.$set(this[name], key, value)
        // }

      })),
      
      ...computed

    }

  }

}

let deepMerge = (source, target, ...more) =>
  more.length
    ? deepMerge(
      deepMerge(source, target),
      ...more
    ) : {
      ...source, 
      ...target, 
      ...mapValues(source, ( value, key ) =>
        target[key] && isObject(value)
          ? isArray(value)
            ? [ ...value, ...target[key] ]
            : deepMerge( value, target[key] )
          : ( target[key] || value )
        )
    }

function toggle(key) {
  this[key] = !this[key] || undefined
}

function viaIndex(key) {

  let pluralKey = plural(key)

  return {

    data() {
      return {
        [pluralKey]: null,
        [key]: null
      }
    },

    computed: {
      [key + '_index']: {
        get() { return findIndex(this[pluralKey], this[key]) },
        set(index) { this[key] = this[pluralKey][index] }
      }
    }

  }
}

const jsonClone = what => JSON.parse(JSON.stringify(what))

function getCaretPosition(idOrElement) {
  let element = typeof idOrElement === 'string' ? document.getElementById(idOrElement) : idOrElement
  let { children } = element
  let { endContainer: { parentElement }, endOffset } = getSelection().getRangeAt(0)
  let text = 
    map(
      slice(
        children, 0, indexOf(children, parentElement)
      ), 'innerText'
    ).join('') 
    + parentElement.innerText.slice(0, endOffset)
  return text.length
}

export {

  appendedTarget,
  always,
  assignMethods,
  assignProperties,
  Awaitable,
  // debug,
  getCaretPosition,
  deepMerge,
  filteredParameters,
  getUser,
  jsonClone,
  keyedPromises,
  loggedInMiddleware,
  Meta,
  ms,
  objectify,
  sleep,
  slugify,
  toggle,
  viaIndex

}