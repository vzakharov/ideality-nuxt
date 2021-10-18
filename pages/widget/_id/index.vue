<template>
  <div class="container-sm w-auto p-3 bg-light mx-auto" style="max-width: 800px">
    <template v-if="admin">
      <Navbar/>
      <h1 class="ideality-widget-heading" v-text="config.display.name"/>
      <ul class="nav nav-tabs">
        <li class="nav-item" v-for="item in [
          { caption: 'Configure', editing: true },
          { caption: 'Try it out!', editing: false },
        ]" :key="item.caption">
          <a href="#" :class="{'nav-link': true, active: editing===item.editing}" v-text="item.caption" @click="editing=item.editing"/>
        </li>
      </ul>
      <WidgetConfig v-if="editing" v-bind="{config, id}"
        v-on="{loadFromYaml}"
      />
    </template>
    <WidgetProper v-if="!editing" v-bind="{config, id}"/>
  </div>
</template>

<script>
// import "bootstrap/dist/css/bootstrap.min.css"
// import "bootstrap"

import yaml from 'js-yaml'
import { assign, identity, map, mapValues, pick, pickBy, remove } from 'lodash'
import { parseKids } from '~/plugins/helpers'


export default {

  data() { 
  
    assign(this, { yaml })

    return {
      widget: this,
      editing: false
    }
    
  },

  async asyncData({ $axios, query, params }) {
    let { id } = params
    let { admin } = query
    admin = typeof admin !== 'undefined'
    let { response } = await $axios.$get('https://ideality.app/version-test/api/1.1/obj/widget/' + id)
    let { owner } = response
    admin = admin && owner
    
    console.log(parseKids)
    let config = mapValues(
      pickBy(pick(response, 
        ['setup', 'display', 'template']
      )), 
      JSON.parse
    )

    return { config, id, admin }
  },

  methods: {
    loadFromYaml() { console.log(arguments) }
  },

  mounted() {
    window.vm = this
  }

}



</script>

<style>
.ideality-label {
  font-weight: bold
}
</style>