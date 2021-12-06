<template>
  <Container>
    <h2>Your projects</h2>
    <Cards v-model="projects" type="project" route-prefix="builder"/>
  </Container>
</template>

<script>

  import { without } from 'lodash'

  export default {

    data() {

      return {
        projects: []
      }

    },

    mounted() {

      this.projects = JSON.parse(localStorage.getItem('builder.projects') || '[]')

    },

    watch: {
      projects(projects) {
        if (process.client)
          localStorage.setItem('builder.projects', JSON.stringify(projects))
      }
    },

  }

</script>

<style>

</style>