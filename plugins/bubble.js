import Axios from 'axios'
import { load } from 'js-yaml'
import { camelCase, mapKeys, mapValues, sortBy } from 'lodash'
import { singular } from 'pluralize'

function Bubble({token, admin } = {}) {

  const axios = Axios.create({ 
    baseURL: 'https://b.ideality.app/api/1.1/',
    ...( token || admin ? {
      headers: {'Authorization': token || ( admin && 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20' )}
    } : {})
  })

  
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

      if ( fetchMany ) {
        if ( options.sortBy )
          things = sortBy(things, options.sortBy)
        return things
      } else
        return things[0]

    },

    async go( workflow, body ) {
      console.log(workflow, body)
      let { data: { response } } = await axios.post('/wf/'+workflow, body)
      console.log(response)
      return response
    }
  
  })

}

Bubble.load = ( type, query, options ) => 
  async ({ $auth, params: { id }}) => {
    // console.log(options)
    let result = {}
    let bubble = new Bubble($auth && { token: $auth.strategy.token.get() })
    result[type] = await bubble.get(type, id || query, options)    
    return {...result, loaded: true}
  }

Bubble.admin = new Bubble({admin: true})
Bubble.anon = new Bubble()

export default Bubble