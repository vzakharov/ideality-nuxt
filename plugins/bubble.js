import Axios from 'axios'
import { load } from 'js-yaml'
import { camelCase, mapKeys, mapValues } from 'lodash'

function Bubble({token, admin } = {}) {

  const axios = Axios.create({ 
    baseURL: 'https://ideality.app/version-test/api/1.1/',
    ...( token || admin ? {
      headers: {'Authorization': token || ( admin && 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20' )}
    } : {})
  })

  
  Object.assign(this, {


    async get( type, idOrQuery ) {
      console.log(arguments)
      let id = typeof idOrQuery === 'string' && idOrQuery
      let query = !id && idOrQuery
      let isSlug = id && !id.match(/^\d/)

      const url = `obj/${type}/`

      let constraint_type = 'equals'

      let { data: { response }} = await (
        ( id && !isSlug ) ? 
          axios.get(url + id) : 
          axios.get(url, { params: { constraints: JSON.stringify(
            isSlug ?
              [{
                key: 'Slug', value: id, constraint_type
              }] 
              : Object.entries(query).map(([key, value]) => ({
                key, value, constraint_type
              }))
          )}})
      )

      let things = (
        response.results || [response]
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

      return id || isSlug ? things[0] : things

    }
  
  })

}

Bubble.load = type => 
  async ({ $auth, params: { id }}) => {
    let result = {}
    let bubble = new Bubble($auth && { token: $auth.strategy.token.get() })
    result[type] = await bubble.get(type, id)    
    return result
  }

export default Bubble