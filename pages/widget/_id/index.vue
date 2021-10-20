<template>
  <div class="container-sm w-auto p-3 bg-light mx-auto" style="max-width: 800px">
    <div v-if="admin && !canAdmin">
      Log in to access the admin dashboard.
      <Login/>
    </div>
    <template v-if="canAdmin">
      <Navbar/>
      <template v-if="config">
        <h2 class="ideality-widget-heading" v-text="config.name"/>
        <ul class="nav nav-tabs">
          <li class="nav-item" v-for="item in [
            { caption: 'Configure', editing: true },
            { caption: 'Try it out!', editing: false },
          ]" :key="item.caption">
            <a href="#" :class="{'nav-link': true, active: editing===item.editing}" v-text="item.caption" @click="editing=item.editing"/>
          </li>
        </ul>
        <WidgetConfig v-if="editing" v-bind="{config, id}"
          v-on="{
            loadFromYaml,
            deleted: () => { $router.push({name: 'dashboard'}) }
          }"
        />
      </template>
      <div v-else v-text="'Please select a widget from the menu above.'"/>
    </template>
    <WidgetProper v-if="!editing" v-bind="{config, id}"/>
  </div>
</template>

<script>
// import "bootstrap/dist/css/bootstrap.min.css"
// import "bootstrap"

import yaml from 'js-yaml'
import { assign, findIndex, get, identity, map, mapValues, pick, pickBy, remove } from 'lodash'
import { parseKids } from '~/plugins/helpers'


export default {

  head() { return {
    title: `${get(this, 'config.name') } 🔺 Ideality widget`
  }},

  data() { 
  
    assign(this, { yaml })

    return {
      editing: false
    }
    
  },

  async asyncData({ $axios, route, $auth }) {
    return loadWidget( { $axios, $auth, $route: route} )
  },

  mounted() {
    window.vm = this
  },

  methods: {
    loadFromYaml() { console.log(arguments) }
  },

  watch: {
    async '$auth.user._id'(id) {
      if (id) {
        let data = await loadWidget(this)
        assign(this, data)
      }
    }
  }

}

async function loadWidget({ $axios, $auth, $route }) {
  console.log(arguments)
  let { params, query } = $route
  let { id } = params
  let { admin } = query
  admin = typeof admin !== 'undefined'

  if ( !$auth.user )
    await $auth.loginWith('local', {data: {tmp: true}})

  let { response } = await $axios.$get('https://ideality.app/version-test/api/1.1/obj/widget/' + id)
  let { owner, maker, name } = response
  let canAdmin = admin && ( owner || maker )


  console.log(parseKids)
  let config = {
    ... mapValues(
      pickBy(pick(response, 
        ['setup', 'display', 'template']
      )), 
      JSON.parse
    ),
    name
  }

  return { config, id, admin, canAdmin }
}

</script>

<style>
.ideality-label {
  font-weight: bold
}
</style>