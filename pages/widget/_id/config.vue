<template>
  <div class="container-sm w-auto p-3 bg-light mx-auto" style="max-width: 800px">
    <div v-if="!canAdmin">
      Log in to access the admin dashboard.
      <Login/>
    </div>
    <template v-if="canAdmin">
      <Navbar/>
      <template v-if="widget">
        <h2 class="ideality-widget-heading" v-text="widget.display.name"/>
        <ul class="nav nav-tabs">
          <li class="nav-item" v-for="item in [
            { caption: 'Configure', editing: true },
            { caption: 'Try it out!', editing: false },
          ]" :key="item.caption">
            <a href="#" :class="{'nav-link': true, active: editing===item.editing}" v-text="item.caption" @click="editing=item.editing"/>
          </li>
        </ul>
        <WidgetConfig v-if="editing" v-model="widget" v-bind="{id}"
          v-on="{
            loadFromYaml,
            deleted: () => { $router.push({name: 'dashboard'}) }
          }"
        />
      </template>
      <div v-else v-text="'Please select a widget from the menu above.'"/>
    </template>
    <WidgetProper v-if="!editing" v-bind="{widget}"/>
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

  head() { return {
    title: `${get(this, 'widget.display.name') } 🔺 Ideality widget`
  }},

  data() { 
  
    assign(this, { yaml })

    return {
      editing: true
    }
    
  },

  asyncData: Bubble.load('widget'),

  computed: {
    canAdmin() { return this.widget.owner || this.widget.maker }
  },

  mounted() {
    window.vm = this
  },

  methods: {
    loadFromYaml() { console.log(arguments) }
  },

  watch: {
    async '$auth.id'(id) {
      if (id)
        assign(this, Bubble.load('widget'))
    }
  }

}

</script>

<style>
.ideality-label {
  font-weight: bold
}
</style>