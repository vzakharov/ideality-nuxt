import Vue from 'vue'
import { get, set, keys, mapValues, pickBy } from 'lodash'
import { canRunWidget } from '@/plugins/helpers'

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
    }
  },

  methods: {

    element: window.document.getElementById,

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

    invert(what) {
      set(this, what, !get(this, what))
    },

    setDefaults
  }

})