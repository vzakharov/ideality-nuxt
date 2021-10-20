import Vue from 'vue'
import { get } from 'lodash'

function canRunWidget(user = get(this, '$auth.user')) {
  return user && ( !user.temporary || user.widgetRuns < 10 )
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
  }

})