import Vue from 'vue'
import { get, keys, mapValues, pickBy } from 'lodash'
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
    hasQueryTag(tag) {
      return this.queryTags[tag]
    },

    setDefaults
  }

})