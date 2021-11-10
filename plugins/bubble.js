import Axios from 'axios'
import { load } from 'js-yaml'
import { assign, camelCase, isArray, isObject, keys, map, mapKeys, mapValues, omit, sortBy } from 'lodash'
import { singular } from 'pluralize'

function Bubble({ $auth, token } = {}) {

  console.log($auth)
  if ( $auth )
    token = $auth.strategy.token.get()

  let {NUXT_ENV_BUBBLE_URL} = process.env
  console.log({NUXT_ENV_BUBBLE_URL})

  let axios = Axios.create({ 
    baseURL: process.env.NUXT_ENV_BUBBLE_URL,
    ...( token || {} )
  })

  console.log({token})

  
  Object.assign(this, {


    async get( type, idOrQuery, options = {}) {
      // if (type=='code') debugger
      // console.log(options)
      let id = typeof idOrQuery === 'string' && idOrQuery
      let query = !id && idOrQuery
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

      
      let { data: { response }} = await (
        ( id ) ? 
          axios.get(url + id) : 
          axios.get(url, { params })
      )
      
      let things = (
        id ? [ response ] : response.results
      ).map(thing => 
          mapKeys(
            mapValues(thing, value => {
              const isString = typeof value === 'string'
              if ( isString && value[0]=='{' )
                try {
                  return JSON.parse(value)
                } catch {
                  return value
                }       
              else {
                if ( isString && value.match(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ$/) )
                  return new Date(value)
                else
                  return value
              }
            }),
            (value, key) => {
              switch(key) {
                case 'Slug': return 'slug'
                case '_id': return 'id'
                default: return key
              }
            }
          )
      )

      // console.log(things)

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

      return result

    },

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
        let { data: { response } } = await axios.post('/wf/'+workflow, body)
        parse(response)
        // console.log(response)
        return response
      } catch({response, response: {data, request: { path }}}) {
        // console.log({...data, path})
        throw({...data, path})
      }
    }
  
  })

}

Bubble.asyncData = ( type, query, options ) => 
  async ({ $auth, route, $route}) => {
    let { params: { id }} = route || $route
    // console.log(options)
    let result = {}
    let bubble = new Bubble($auth && { token: $auth.strategy.token.get() })
    result[type] = await bubble.get(type, query || id, options)    
    return {...result, loaded: true}
  }

Bubble.anon = new Bubble()

function parse(object) {

  const process = thing => mapKeys(
    mapValues(thing, value => {
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
    }),
    (value, key) => camelCase(key)
  )

  for ( let key of keys(object) ) {
    let value = object[key]
    if ( isArray(value) )
      object[key] = map(value, process)
    else if ( isObject(value) )
      object[key] = process(value)
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