import Axios from 'axios'
import { load } from 'js-yaml'
import { assign, camelCase, isArray, isObject, keys, map, mapKeys, mapValues, omit, sortBy } from 'lodash'
import { singular } from 'pluralize'

function Bubble({$auth, token, admin } = {}) {

  console.log($auth)
  if ( $auth )
    token = $auth.strategy.token.get()

  let axios = Axios.create({ 
    baseURL: 'https://b.ideality.app/api/1.1/',
    ...( token || admin ? {
      headers: {'Authorization': token || ( admin && 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20' )}
    } : {})
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
            key, value, constraint_type
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
            (value, key) =>
              camelCase(key)
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

    async go( workflow, body ) {
      body = omit(body, v => typeof v === 'undefined') 
      console.log(this, workflow, body)
      let { data: { response } } = await axios.post('/wf/'+workflow, body)
      parseResponse(response)
      console.log(response)
      return response
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

Bubble.admin = new Bubble({admin: true})
Bubble.anon = new Bubble()

function parseResponse(response) {

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

  for ( let key of keys(response) ) {
    let value = response[key]
    if ( isArray(value) )
      response[key] = map(value, process)
    else if ( isObject(value) )
      response[key] = process(value)
  }

}

export default Bubble