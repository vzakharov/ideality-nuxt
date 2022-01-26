import Vue from 'vue'
import { find, findKey, forEach, get, isArray, set, keys, mapValues, pickBy } from 'lodash'
import { always, appendedTarget, getUser, slugify } from '@/plugins/helpers'
import axios from 'axios'
import Bubble from '~/plugins/bubble'
import { load, dump } from 'js-yaml'
import { isPlural } from 'pluralize'

function admining() {
  return this.queryFlags.admin && this.isAdmin
}

function bubble() {
  return new Bubble(this)
}

function hashRoute() {
  return this.$route.hash.slice(1)
}

function head() {
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
}

function widgetHeader() {
  let { widget } = this
  if ( widget ) {
    let { name: title, description } = widget
    return {
      title, description 
    }
  }
}

function isAdmin() {
  return this.$auth.user && this.$auth.user.isAdmin
}

function narrow() {
  return this.store.narrow
}

function queryFlags() {
  return mapValues(
    pickBy(this.route.query,
      tag => !tag && ( typeof tag !== 'undefined' )
    ), () => true)
}

function route() {
  return this.$route
}

function setDefaults(object, defaults) {
  for (let key of keys(defaults)) {
    if (typeof object[key] == 'undefined') {
      this.$set(object, key, defaults[key])
    }
  }
  return object
}

function store() {
  let { $store } = this
  return Object.defineProperties({}, { 
    ...mapValues($store.state, (value, key) => ({
      get: () => $store.state[key],
      set: value => $store.commit('set', { [key]: value })
    })),
    commit: (...args) => $store.commit(...args)
  })
}

function width() {
  return this.$store.state.width
}


Vue.mixin({

  data() {

    // If the vm involves loading data from localStorage, this is where we start
    return {
      localLoaded: false,
      mounted: false
    }

  },

  created () { 
    this.vm = this
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
        window.vms[this._name] = {}
      
      window.vms[this._name][this._uid] = this

      if (!window.axios)
        window.axios = axios 

      this.mounted = true
    }
    

  },

  computed: {

    admining,
    bubble,
    hashRoute,
    head,
    isAdmin,
    narrow,
    props() { return this.$props },
    queryFlags,
    route,
    store,
    widgetHeader,
    width

  },

// watch: {
//   '$route': { deep: true, handler: function(route) {
//     if (this.$parent) return
//     // window.vms = []
//     console.log({route})
//     // this.$store.commit('set', { route })
//   }}
// },

  methods: {

    appendedTarget,

    appendedUrl() {
      return this.$router.resolve(this.appendedTarget(...arguments)).href
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

    get,

    getFullUrl(target) {
      return 'ideality.app' + this.$router.resolve(target).href
    },

    getUser,



    reactify(object) {
      let vm = this
      forEach(object, ( value, key ) => {
        // debugger
        if ( Object.getOwnPropertyDescriptor(object, key).get?.name != 'reactiveGetter' ) {
          vm.$set(object, key, value)
        }
      })
    },

    control(key) {
      return {
        model: Object.defineProperty({}, key, {
          get: () => this[key],
          set: value => this[key] = value
        })
      }
    },

    debug(what) {
      debugger
      return what
    },
  
    element: () => process.client && window.document.getElementById,

    hasProp(prop) {
      return typeof this.$props[prop] !== 'undefined'
    },

    syncLocal(localKey, { from, mergeBy, select, where, slugifyName, as, inline } = {}) {

      let local, data, items, collection
      let isList = isPlural(localKey)

      if ( !inline && !as ) as = localKey

      const getData = () => {
        local = load(localStorage.getItem(localKey)) || (
          isPlural ? [] : {}
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

      getData()

      if ( mergeBy ) {
        let list = this[as]
        for ( let item of list ) {
          this.setFieldsFor(item, find( data, { [mergeBy]: item[mergeBy]} ) || {})
        }
      } else
        Object.assign(this, {
          ...as ? { [as]: data} : data,
          localLoaded: true
        })
      
      forEach(select ? isArray(select) ? select : [select] : as ? [as] : keys(this.$data), key => {
        
        this.$watch(key, { deep: true, handler(value) {
          
          if ( slugifyName && key == 'name' ) {
            Object.assign(this, { slug: slugify(value, items) })
            return
          }

          if ( !as )
            set(getData(), key, value)

          localStorage.setItem(localKey, dump(local))

          if ( key == 'slug' ) {
            this.$router.push(this.appendedTarget({ params: { [name]: this.slug }}))
          }

        }})
      })


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

    log(what) {
      console.log(what)
      return what  
    },

    isHash(tag) {

      let object = {}
      let vm = this
      Object.defineProperty(object, 'state', {
        get() {
          return vm.route.hash.slice(1) == tag
        },
        set(value) {
          vm.$router.push({ hash: value ? `#${tag}` : null })
        }
      })

      object.set = () => object.state = true
      object.clear = () => object.state = false
      object.toggle = () => object.state = !object.state

      return object

    },

    isRoute(route, defaultRoute = { reset: mapValues(route, always(true)) }) {
      
      return Object.defineProperty({}, 'state', {
        get: () => !!find(route, ( value, key ) => dump(this.$route[key]) == dump(value)),
        set: value => this.$router.push(appendedTarget({ route: this.$route, ...value ? route : defaultRoute}))
      })

    },

    hasQueryFlag(tag) {
      return this.queryTags[tag]
    },

    please(doWhat) {
      return doWhat.apply(this)
    },

    prop(key) {
      return this.$props[key] === '' ? true : this.$props[key]
    },

    pseudoLink(route) {
      // debugger
      return {
        to: this.appendedTarget(route),
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

    setFieldsFor(object, fields) {
      for ( let key of keys(fields) ) {
        this.$set(object, key, fields[key])
      }
    },

    setDefaults,

  }

})