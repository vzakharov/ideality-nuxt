<template>
  <Container>
    <h1>{{ name }}</h1>
    <LabeledInput lazy caption='Name' v-model="name"/>
    <h2>Assets</h2>
    <Cards v-model="builds" type="build" route-prefix="builder-project"/>
  </Container>
</template>

<script>

  import { find } from 'lodash'
  
  export default {

    data() {
      return {
        name: null,
        slug: null,
        builds: []
      }
    },

    mounted({ $route: { params: { project: slug }}} = this) {
      console.log({slug})
      this.loadLocal({
        getItems: local => local.builder.projects,
        slugParam: 'project'
      })
    },

    watch: {
      name(value) {
        
      }
    }

  }

</script>

<style>

</style>