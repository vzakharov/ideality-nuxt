import Vue from 'vue'
import { get, keys } from 'lodash'


function canRunWidget(user = get(this, '$auth.user')) {
  return user && ( !user.temporary || user.widgetRuns < 10 )
}

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
    canRunWidget
  },
  
  methods: {
    setDefaults
  }

})