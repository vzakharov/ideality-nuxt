export const state = () => ({
  path: '',
  headers: null,
  updatedRoute: null,
  tree: {
    children: [{ 
      body: 'Hello world', children: [{
        body: '! My name is', children: [{
          body:' Vova', children: [{
            body: '. Bye-bye!'
          }]}, {
            body: ' Jack.'
          }
        ]
      }, {
        body: '. How are you?',
        children: [{
          body: " I'm okay"
        }]
      }, {
        body: '? Hmm...'
      }, {
        body: 'Test'
      }]
    }]
  }
})

export const mutations = {

  set(state, values) {
    console.log({state, values})
    Object.assign(state, values)
  }

}

export const actions = {
  nuxtServerInit({ commit }, { req: { headers } }) {
    // console.log({commit, req})
    commit('set', { headers })
  }
}