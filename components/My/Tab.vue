<template>
  <b-nav-item 
    :active="nowSection==section" 
    :to="route"
  >
    <!-- @click.prevent="pseudoRoute(route); $emit('input', section)"
    :href="appendedUrl(route)" -->
    {{ title }}
  </b-nav-item>
</template>

<script>

  import { upperFirst } from 'lodash'
  
  export default {

    props: ['section'],

    computed: {

      nowSection() {
        return this.$route.params.section
      },

      route({ section } = this) {
        return { params: { section }}
      },

      title() {
        return upperFirst(this.section)
      }


    }

  }
</script>

<style>

</style>