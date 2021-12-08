<template>
  <Container>
    <h2>Your projects</h2>
    <Cards v-model="projects" type="project" route-prefix="builder"/>
  </Container>
</template>

<script>

  import { dump } from 'js-yaml'
  import { get } from 'lodash'
  
  export default {

    data() { 
      return {
        projects: []
      }
    },

    mounted() {
      this.loadLocal('builder')
    }

  }

</script>

<style>

</style>