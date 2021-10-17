<template>
  <div class="container-sm w-auto p-3 bg-light mx-auto" style="max-width: 800px">
    <template v-if="admin">
      <Navbar/>
      <h1 class="ideality-widget-heading" v-text="config.name"/>
      <ul class="nav nav-tabs">
        <li class="nav-item" v-for="item in [
          { caption: 'Configure', editing: true },
          { caption: 'Try it out!', editing: false },
        ]" :key="item.caption">
          <a href="#" :class="{'nav-link': true, active: editing===item.editing}" v-text="item.caption" @click="editing=item.editing"/>
        </li>
      </ul>
      <WidgetConfig v-if="editing" v-bind="{config, id}"
        @loadYaml="config = yaml.load($event.value)" 
      />
    </template>
    <WidgetProper v-if="!editing" v-bind="{config, display, id}"/>
  </div>
</template>

<script>
// import "bootstrap/dist/css/bootstrap.min.css"
// import "bootstrap"

import yaml from 'js-yaml'
import { assign, map } from 'lodash'


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
    let { config, display, owner } = response
    admin = admin && owner
    var parseJsons = (...jsons) => jsons.forEach((json, i) => jsons[i] = JSON.parse(json))
    config = {...JSON.parse(config)}
    parseJsons(config)

    return { config, id, admin }
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