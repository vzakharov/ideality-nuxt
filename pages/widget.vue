<template>
  <div class="p-2">
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
    <WidgetProper v-else v-bind="{config, id}"/>
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

  async asyncData({ $axios, query }) {
    let { id } = query
    let { response } = await $axios.$get('https://ideality.app/version-test/api/1.1/obj/widget/' + id)
    let { config } = response
    config = JSON.parse(config)

    return { config, id }
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