<!-- A tab automatically routed to relevant section (section in route params) -->
<template>
  <b-nav-item 
    :active="nowSection==section" 
    :to="route"
  >
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