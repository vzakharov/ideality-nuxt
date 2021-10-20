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
    window.vm = this 
    this.console = window.console
  },
  
  computed: {
    canRunWidget
  }

})