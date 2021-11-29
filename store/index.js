export const state = () => ({
  path: '',
  toolCategories: null,
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

  set(state, keyOrValues, value) {
    if ( value )
      state.keyOrValues = value
    else
      Object.assign(state, keyOrValues)
  }

}

export const actions = {
  nuxtServerInit({ commit }, { req: { headers } }) {
    // console.log({commit, req})
    commit('set', { headers })
  }
}