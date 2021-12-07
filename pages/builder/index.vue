<template>
  <Container>
    <h2>Your projects</h2>
    <Cards v-model="projects" type="project" route-prefix="builder"/>
  </Container>
</template>

<script>

  import locallyStored from '~/plugins/locallyStored'

  export default {

    mixins: [ locallyStored('builder') ],

    data() {
      return {
        projects: []
      }
    }
  }

</script>

<style>

</style>