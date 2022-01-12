import { get } from 'lodash'

export const state = () => ({
  builds: null,
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
    commit('set', { headers })
  }
}