import Axios from 'axios'
import { load } from 'js-yaml'
import { assign, camelCase, chain, forEach, isArray, isObject, keys, map, mapKeys, mapValues, omit, sortBy } from 'lodash'
import { singular, plural } from 'pluralize'

function Bubble({$auth, token } = {}) {

  if ( $auth )
    token = $auth.strategy.token.get()

  let {NUXT_ENV_BUBBLE_URL} = process.env

  let axios = Axios.create({ 
    baseURL: process.env.NUXT_ENV_BUBBLE_URL,
    ...token ? {
      headers: {Authorization: token }
    } : {}
  })

  // console.log({token})

  Object.assign(this, {


    async get( type, idOrQuery, options = {}) {
      // if (type=='code') debugger
      // console.log(options)
      let id = typeof idOrQuery === 'string' && idOrQuery
      let query = !id && idOrQuery || {}
      let slug = id && !id.match(/^\d/) && id
      if ( slug )
        id = undefined
      // console.log(slug, id)
      let fetchMany = !id & !slug
      if ( fetchMany )
        type = singular(type)

      const url = `obj/${type}/`

      let constraint_type = 'equals'

      // console.log(idOrQuery)

      let params = { constraints: JSON.stringify(
        slug ?
          [{
            key: 'Slug', value: slug, constraint_type
          }] 
          : Object.entries(query).map(([key, value]) => ({
            key, 
            value: isObject(value) ? value.id : value, 
            constraint_type
          }))
      )}

      let doFetch = () => (
        ( id ) ? 
          axios.get(url + id) : 
          axios.get(url, { params })
      )

      let { data: { response }} = await doFetch()
      
      let { results } = response

      if ( results ) {
        let { remaining } = response
        if ( remaining ) {
          let promises = []
          for ( let cursor = 100; cursor < remaining + 100 ; cursor += 100 ) {
            Object.assign(params, { cursor, limit: 100 })
            promises.push(new Promise(resolve =>
              doFetch().then(
                ( { data: { response: { results: moreResults }}} ) => resolve(moreResults)
              )
            ))
          }
          results = [...results, ...await Promise.all(promises)].flat()
          console.log
        }
      }
      
      let things = id ? [ response ] : results
      let object = {}
      object[type] = things
      parse(object)

      console.log({ object })

      things = object[type]
      console.log({ things })

      let result
      if ( fetchMany ) {
        if ( options.sortBy )
          things = sortBy(things, options.sortBy)
        result = things
      } else
        result = things[0]
      
      if ( options.includeKey ) {
        let keyedResult = {}
        keyedResult[type] = result
        result = keyedResult
      }
      
      console.log({result})

      return result

    },

    destroy: (type, thing) =>
      axios.delete(`obj/${type}/${thing.id}`),

    patch: (type, thing) => 
      axios.patch(`obj/${type}/${thing.id}`, unparse(omit(thing, 'Slug', 'id'))),

    post: async (type, thing) => {
      try {
        let { data: { id }} = await axios.post(`obj/${type}`, thing)
        return { id }
      } catch(error) {
        console.log(error.response.data)
        let { statusCode, body } = error
        throw({statusCode, ...body})
      }
    },

    async go( workflow, body ) {
      body = omit(body, v => typeof v === 'undefined') 
      // console.log(this, workflow, body)
      try {
        forEach(body,  ( value, key ) => {
          if ( typeof value == 'object' ) {
            body[key] = JSON.stringify(value)
          }
        })
        let { data: { response } } = await axios.post('/wf/'+workflow, body)
        parse(response)
        console.log({response})
        return response
      } catch({ response, ...error }) {
        if ( response ) {
          let {data, request: { path }} = response
          throw({...data, path})
        } else
          throw(error)
        // console.log({...data, path})
      }
    }
  
  })

}

Bubble.asyncData = ( type, query, options ) =>  {
  return async ({ $auth, route, $route}) => {
    let { params: { id, slug }} = route || $route
    id = id || slug
    // console.log(options)
    let result = {}
    let bubble = new Bubble($auth && { token: $auth.strategy.token.get() })
    let value = await bubble.get(type, query || id, options)
    result[type] = value
    return {...result, loaded: true}
  }
}

// Bubble.admin = new Bubble({admin: true})
Bubble.anon = new Bubble()

Bubble.reservedProperties = ['Slug', '_id', 'Modified Date', 'Created Date', 'Created By']
Bubble.camelcasedReservedProperties = map(Bubble.reservedProperties, camelCase)

function parse(object) {

  const process = ( thing, type, object ) => {

    thing = mapValues(thing, value => {
      const isString = typeof value === 'string'
      if (isString && value[0] == '{')
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      else {
        if (isString && value.match(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ$/))
          return new Date(value)
        else
          return value
      }
    })

    if ( singular(type) == 'widget' && thing.template ) {
      // debugger
      thing.slate = thing.slate || thing.template
      delete thing.template
    }

    for (let key of Bubble.reservedProperties) {
      thing[camelCase(key)] = thing[key]
      delete thing[key]
    }

    console.log({thing})

    return thing
  }

  for ( let key of keys(object) ) {
    let value = object[key]
    if ( isArray(value) ) {
      if ( value.length > 0 && isObject(value[0]) )
        object[key] = map(value, value => process(value, key, object))
    }
    else if ( isObject(value) ) {
      object[key] = process(value, key, object)
    }
  }

}

function unparse(object) {

  return mapValues(object, value =>
    isObject(value) && !isArray(value) ?
      JSON.stringify(value) :
      value
  )

}

export default Bubble