export const state = () => ({
  path: '',
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
    // debugger
    Object.assign(state, values)
  }

}