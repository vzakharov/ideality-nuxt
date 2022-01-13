import Vue from 'vue'
import { find, forEach, get, isArray, set, keys, mapValues, pickBy } from 'lodash'
import { appendedTarget, slugify } from '@/plugins/helpers'
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

    // If the vm involves loading data from localStorage, this is where we start
    return {
      $localLoaded: false
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
        window.vms[this._name] = []
      
      window.vms[this._name].push(this)

      if (!window.axios)
        window.axios = axios 

      if (this._name=='<MySidebarred>') console.log(this)
      if ( typeof this.width !== 'undefined' ) {
        let setWidth = () => {
          this.width = window.innerWidth
        }
  
        setWidth()
        window.onresize = () => {
          setWidth()
        }  
      }

    }

  },

  computed: {

    bubble() {
      return new Bubble(this)
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

    queryFlags() {
      return mapValues(
        pickBy(this.$route.query,
          tag => !tag && ( typeof tag !== 'undefined' )
        ), () => true)
    },
    
    user() { return this.$auth.user || {}}
  },

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

    getFullUrl(target) {
      return 'ideality.app' + this.$router.resolve(target).href
    },

    reactify(object) {
      let vm = this
      forEach(object, ( value, key ) => {
        // debugger
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

    debug() {
      debugger
    },
  
    element: () => process.client && window.document.getElementById,

    hasProp(prop) {
      return typeof this.$props[prop] !== 'undefined'
    },

    syncLocal(localKey, { from, select, where, slugifyName, as }) {

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
        ...as ? { [as]: getData()} : getData(),
        $localLoaded: true
      })
      
      forEach(select ? isArray(select) ? select : [select] : keys(this.$data), key => {

        this.$watch(key, { deep: true, handler(value) {
          
          if ( slugifyName && key == 'name' ) {
            Object.assign(this, { slug: slugify(value, items) })
            return
          }

          if ( as && !select )
            local = value // Todo: merge arrays
          else
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

    hash(tag) {

      let object = {}
      let vm = this
      Object.defineProperty(object, 'state', {
        get() {
          return vm.$route.hash.slice(1) == tag
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

    setDefaults
  }

})