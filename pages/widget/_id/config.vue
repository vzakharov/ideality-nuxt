<template>
  <div>
    <div v-if="!canAdmin">
      You don’t have access to edit this widget.
    </div>
    <template v-else>
      <WidgetConfig v-model="widget" v-bind="{id: widget.id}"
        v-on="{
          loadFromYaml,
          deleted: () => { $router.push({name: 'dashboard'}) }
        }"
      />
    </template>
  </div>
</template>

<script>
// import "bootstrap/dist/css/bootstrap.min.css"
// import "bootstrap"

import yaml from 'js-yaml'
import { assign, findIndex, get, identity, map, mapValues, pick, pickBy, remove } from 'lodash'
import { parseKids } from '@/plugins/helpers'
import Bubble from '@/plugins/bubble'

export default {

  middleware: ['loggedIn'],

  head() { return {
    title: `${get(this, 'widget.name') } 🔺 Ideality widget`
  }},

  data() { 

    assign(this, { yaml })

    return {
      editing: true
    }
    
  },

  asyncData: Bubble.asyncData('widget'),

  computed: {
    canAdmin() { return get(this, '$auth.user.id') == get(this, 'widget.owner') }
  },

  mounted() {
    window.vm = this
  },

  methods: {
    loadFromYaml() { console.log(arguments) }
  },

  watch: {
    async '$auth.user.id'(id) {
      if (id) {
        let { widget } = await Bubble.asyncData('widget')(this)
        assign(this, {widget})
      }
    }
  }

}

</script>

<style>
.ideality-label {
  font-weight: bold
}
</style>