<template>
  <Container>
    <h1>{{ name }}</h1>
    <LabeledInput v-model="name"/>
  </Container>
</template>

<script>

  import { find } from 'lodash'
  
  export default {

    data() {
      return {
        name: null,
        id: this.$route.params.project
      }
    },

    mounted({ id } = this) {
      this.loadLocal( data => find(data.builder.projects, { id }) )
    }
  }

</script>

<style>

</style>