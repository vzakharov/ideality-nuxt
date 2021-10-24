import axios from 'axios'

function Bubble() {

  const baseURL = 'https://ideality.app/version-test/api/1.1/'

  const bubble = axios.create({ 
    baseURL,
    headers: {'Authorization': 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20'} 
  })

  return {

    async get( type, idOrQuery ) {
      let id = typeof idOrQuery === 'string' && idOrQuery
      let query = !id && idOrQuery

      const url = `obj/${type}/`
      let { data: { response }} = await (
        id ? 
          bubble.get(url + id) : 
          bubble.get(url, { params: { constraints: 
            Object.entries(query).map(([key, value]) => ({
              key, value, constraint_type: 'equals'
            }))
          }})
      )

      console.log(response)
      
      return id ? response: response.results

    }
  

  }

}

export default Bubble