import Vue from 'vue'
import { assign, chain, forEach, get, set, keys, mapValues, pickBy } from 'lodash'
import { canRunWidget, isDefined } from '@/plugins/helpers'
import axios from 'axios'
import Bubble from '~/plugins/bubble'
import { load, dump } from 'js-yaml'
import { thisTypeAnnotation } from '@babel/types'

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

    if (process.client) {

      Object.assign(this, {
        window,
        console: window.console
      })
  
      if (!window.vms)
        window.vms = {}
      
      if (!window.vms[this._name])
        window.vms[this._name] = []
      
      window.vms[this._name].push(this)
  
      // console.log({axios})
      if (!window.axios)
        window.axios = axios 
      
      // // Only set this once for the root component
      // if ( !this.$parent && this.$store.state.local.pending ) {

      //   this.$store.commit('set', {
      //     local: load(localStorage.getItem('data')) || {}
      //   })
  
      //   this.$watch('$store.state.local', {
      //     deep: true,
      //     handler(value) {
      //       debugger
      //       localStorage.setItem('data', dump(value))
      //     }
      //   })
      // }


    }

  },

  computed: {
    bubble() {
      return new Bubble(this)
    },

    canRunWidget,

    data() {
      return this.$data
    },


    head() {
      let { header } = this
      if ( header ) {
        let { title, description } = this.header
        title += '🔺 Ideality, AI-powered ideation platform'
        return {
          title,
          meta: [
            { hid: 'description', name: 'description', content: description },
            { hid: 'og:title', name: 'og:title', content: title},
            { hid: 'og:description', name: 'og:description', content: title }
          ]
        }  
      } else {
        return {}
      }
    },

    widgetHeader() {
      let { widget } = this
      if ( widget ) {
        let { name: title, description } = widget
        return {
          title, description 
        }
      }
    },

    isAdmin() {
      return this.$auth.user && this.$auth.user.isAdmin
    },

    process() {
      return process
    },

    queryTags() {
      return mapValues(
        pickBy(this.$route.query,
          tag => !tag && ( typeof tag !== 'undefined' )
        ), () => true)
    },

    route() {
      return this.$store.state.updatedRoute || this.$route
    },
    
    isTest() { return this.queryTags.test },
    user() { return this.$auth.user || {}}
  },

  methods: {

    appendRoute({ params, query, hash, reset }) {
      let { $route } = this
      reset = reset || {}
      return {
        ...$route,
        query: { ...reset.query ? {} : $route.query, ...query },
        params: { ...reset.params ? {} : $route.params, ...params },
        hash: hash || $route.hash
      }
    },

    appendedUrl() {
      return this.$router.resolve(this.appendRoute(...arguments)).href
    },

    control(what) { 
      return { 
        key: JSON.stringify(what),
        value: what,
        // 'v-on': { assign: this.assign }
      }
    },

    element: () => process.client && window.document.getElementById,

    hasProp(prop) {
      return isDefined(this.$props[prop])
    },

    loadLocal(storePath) {

      const getLocal = () => load(localStorage.getItem('data'))

      forEach( get( getLocal(), storePath ), ( value, key ) => {

        this[key] = value

        this.$watch(key, { deep: true, handler(value) {

          debugger
          let local = getLocal()
          set( local, [storePath, key].join('.'), value )
          localStorage.setItem('data', dump(local))

        }})

      })

    },

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
        if ( !element )
          return
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

    please(doWhat) {
      return doWhat.apply(this)
    },

    propFlag(flag) {
      return typeof this.$props[flag] !== 'undefined'
    },

    pseudoRoute({ params, query, hash, replace }) {
      let action = replace ? 'replaceState' : 'pushState'
      window.history[action](null, null,
        this.appendedUrl({ params, query, hash })
      )
    },

    invert(what) {
      set(this, what, !get(this, what))
    },

    setFields(fields) {
      Object.assign(this, fields)
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