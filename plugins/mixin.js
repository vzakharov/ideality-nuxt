import Vue from 'vue'
import { get, set, keys, mapValues, pickBy } from 'lodash'
import { canRunWidget } from '@/plugins/helpers'
import axios from 'axios'

function setDefaults(object, defaults) {
  for (let key of keys(defaults)) {
    if (typeof object[key] == 'undefined') {
      this.$set(object, key, defaults[key])
    }
  }
  return object
}


Vue.mixin({

  created () { 
    this.vm = this 
    this.debug = () => { debugger }
  },

  mounted () {

    Object.assign(this, {
      window,
      console: window.console
    })

    if (!window.vms)
      window.vms = {}
    
    if (!window.vms[this._name])
      window.vms[this._name] = []
    
    window.vms[this._name].push(this)

    console.log({axios})
    if (!window.axios)
      window.axios = axios

  },

  computed: {
    canRunWidget,
    godMode() {
      return this.queryTags.iddqd
    },
    queryTags() {
      return mapValues(
        pickBy(this.$route.query,
          tag => !tag && ( typeof tag !== 'undefined' )
        ), () => true)
    },
    isTest() { return this.queryTags.test },
    user() { return this.$auth.user || {}}
  },

  methods: {

    appendRoute({ params, query, hash }) {
      let { $route } = this
      return {
        ...$route,
        query: { ...$route.query, ...query },
        params: { ...$route.params, ...params },
        hash: hash || $route.hash
      }
    },

    element: window.document.getElementById,

    withElement(id, ...actions) {
      let element = window.document.getElementById(id)
      const next = () =>
        this.$nextTick(() => {
          if ( actions.length ) {
            let action = actions.shift()
            element[action]()
            next()
          }    
        })
      next()
    },

    focus(id, ...furtherActions) {
      this.$nextTick(() => {
        let element = window.document.getElementById(id)
        element.focus()
        const next = () => {
          if ( furtherActions.length ) {
            this.$nextTick(() => {
              let action = furtherActions.shift()
              element[action]()
              next()
            })
          }    
        }
        next()
      })
    },
    
    hasQueryTag(tag) {
      return this.queryTags[tag]
    },

    pseudoRoute({ params, query, hash }) {
      window.history.pushState(null, null,
        this.$router.resolve(appendRoute({ params, query, hash })).href
      )
    },

    invert(what) {
      set(this, what, !get(this, what))
    },

    
    // redirectIfNotLoggedIn() {
    //   if ( !this.$auth.loggedIn )
    //     this.$router.push({
    //       name: 'login',
    //       query: {
    //         then: this.$route.fullPath
    //       }
    //     })
    // },

    setDefaults
  }

})