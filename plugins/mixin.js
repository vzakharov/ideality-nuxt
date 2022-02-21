import Vue from 'vue'
import { find, findIndex, findKey, forEach, get, isArray, last, set, keys, mapValues, pickBy } from 'lodash'
import { always, appendedTarget, Awaitable, getUser, ms, slugify, toggle } from '@/plugins/helpers'
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
  return this.$auth?.user?.isAdmin
}

function user () {
  return this.$auth?.user
}

function loremIpsum() {
  return "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
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

async function loadSample(slug) {
  return this.log(
    await this.$content('samples').where({ slug }).fetch()
  )?.[0]?.data
}


Vue.mixin({

  data() {

    // If the vm involves loading data from localStorage, this is where we start
    return {
      localLoaded: false,
      mounted: false,
      mounting: new Awaitable(true)
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
  
      let { vms } = window
      if (!vms)
        vms = window.vms = {}

      let { _uid, _name } = this

      if (!vms[_name])
        vms[_name] = []
      
      let i = findIndex(vms, { _uid })
      i + 1 ?
        vms[_name][i] = this
        : vms[_name].push(this)

      if (!window.axios)
        window.axios = axios 

      this.mounted = true
      // this.$emit('mounted', this)
      this.mounting.resolve()
    }
    

  },

  computed: {

    admining,
    bubble,
    hashRoute,
    head,
    isAdmin,
    loremIpsum,
    narrow,
    // props() { return this.$props || {} },
    queryFlags,
    route,
    store,
    user,
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

    maybe: what => what || {},

    hasProp(prop) {
      return typeof this.$props[prop] !== 'undefined'
    },

    syncLocal(localKey, { from, mergeBy, select, where, slugifyName, as, inline, beforeWrite } = {}) {

      let local, data, items, collection
      let isList = isPlural(localKey)

      if ( !inline && !as ) as = localKey

      const getData = () => {
        local = load(localStorage.getItem(localKey)) || (
          isList ? [] : {}
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
          this.assignReactive(item, find( data, { [mergeBy]: item[mergeBy]} ) || {})
        }
      } else
        Object.assign(this, {
          ...as ? { [as]: data} : data,
          localLoaded: true
        })
      
      forEach(select ? isArray(select) ? select : [select] : as ? [as] : keys(this.$data), key => {
        
        this.$watch(key, { deep: true, handler(value) {
          
          beforeWrite?.[key]?.()

          if ( slugifyName && key == 'name' ) {
            Object.assign(this, { slug: slugify(value, items) })
            return
          }

          if ( !as )
            set(getData(), key, value)

          // ms('saving to localstorage', true)
          localStorage.setItem(localKey, dump(local))
          // ms('saved')

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

    log(...what) {
      if (process.env.NUXT_ENV_LOGMODE)
        console.log(...what)
      return last(what)
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

    loadSample,

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

    assignReactive(object, fields) {
      for ( let key of keys(fields) ) {
        this.$set(object, key, fields[key])
      }
      return object
    },

    setDefaults,
    toggle

  }

})