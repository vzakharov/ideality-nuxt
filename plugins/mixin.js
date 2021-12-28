import Vue from 'vue'
import { assign, chain, find, forEach, get, isArray, kebabCase, set, keys, mapValues, pick, pickBy } from 'lodash'
import { appendRoute, canRunWidget, isDefined, slugify } from '@/plugins/helpers'
import axios from 'axios'
import Bubble from '~/plugins/bubble'
import { load, dump } from 'js-yaml'

function setDefaults(object, defaults) {
  for (let key of keys(defaults)) {
    if (typeof object[key] == 'undefined') {
      this.$set(object, key, defaults[key])
    }
  }
  return object
}


Vue.mixin({

  data() {
    return {
      $localLoaded: false
    }
  },

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

    appendRoute,

    appendedUrl() {
      return this.$router.resolve(this.appendRoute(...arguments)).href
    }, 

    buildTarget({ slug, secret } = this.build) {
      return {
        view: {
          name: 'i-slug',
          params: { slug }
        },
        edit: {
          name: 'i-slug-section',
          params: { slug, section: 'edit' },
          query: { secret }
        }
      }
    },

    buildUrl() {
      return mapValues( this.buildTarget(...arguments), target => this.getFullUrl(target) )
    },

    download(text, name, format = 'yaml') {
      const anchor = document.createElement('a')
      if ( format == 'yaml' ) 
        text = dump(text)
      anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(text)
      anchor.target = '_blank'
      anchor.download = `${name}.${format}`
      anchor.click()
    },

    getFullUrl(target) {
      return 'ideality.app' + this.$router.resolve(target).href
    },

    reactify(object) {
      let vm = this
      forEach(object, ( value, key ) => {
        debugger
        if ( Object.getOwnPropertyDescriptor(object, key).get?.name != 'reactiveGetter' ) {
          vm.$set(object, key, value)
        }
      })
    },

    control(what) {
      for ( let key of keys(what)) {
        let value = what[key]
        return {
          key: JSON.stringify(value),
          [key]: value
        }
      }
    },

    element: () => process.client && window.document.getElementById,

    hasProp(prop) {
      return isDefined(this.$props[prop])
    },

    syncLocal(localKey, { from, select, where, slugifyName }) {

      let local, data, item, id, items, collection, slug, path

      const getData = () => {
        local = load(localStorage.getItem(localKey)) || (
          where ? [] : {}
        )
        collection = from ? get(local, from) : local
        if ( where ) {
          data = find(collection, where)
          if ( !data ) {
            collection.push(data = where)
          }
        } else {
          data = local
        }
        return data
      }

      Object.assign(this, {
        ...getData(),
        $localLoaded: true
      })
      
      console.log(this.$data, keys(this.$data))
      forEach(select ? isArray(select) ? select : [select] : keys(this.$data), key => {

        console.log({key})
        this.$watch(key, { deep: true, handler(value) {
          
          if ( slugifyName && key == 'name' ) {
            Object.assign(this, { slug: slugify(value, items) })
            return
          }

          set(getData(), key, value)
          localStorage.setItem(localKey, dump(local))

          if ( key == 'slug' ) {
            this.$router.push(this.appendRoute({ params: { [name]: this.slug }}))
          }

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

    prop(key) {
      return this.$props[key] === '' ? true : this.$props[key]
    },

    pseudoLink(route) {
      debugger
      return {
        to: this.appendRoute(route),
        'v-on:click.prevent': () => window.alert('Hello world')
      }
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