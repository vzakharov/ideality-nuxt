<template>
  <Container>
    <h1>{{ name }}</h1>
    <LabeledInput caption='Name' v-model="name"/>
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
        slug: this.$route.params.project,
        builds: []
      }
    },

    mounted({ slug } = this) {
      this.loadLocal( data => find(data.builder.projects, { slug }) )
    }
  }

</script>

<style>

</style>