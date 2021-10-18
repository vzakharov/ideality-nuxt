import Vue from 'vue'

Vue.mixin({

  created () { this.vm = this },
  mounted () { window.vm = this },

})