import { get, set } from 'lodash'

export const state = () => ({
  path: '',
  local: {
    pending: true
  },
  toolCategories: null,
  headers: null,
  updatedRoute: null,
  tree: {  },
  imagePromises: {}
})

export const mutations = {

  set(state, values) {
    Object.assign(state, values)
  },

  setFields(state, [ key, values ]) {
    Object.assign(get(state, key), values)
  }

}

export const actions = {
  nuxtServerInit({ commit }, { req: { headers } }) {
    // console.log({commit, req})
    commit('set', { headers })
  }
}