<template>
  <Container>
    <h1>{{ name }}</h1>
    <LabeledInput v-model="name"/>
  </Container>
</template>

<script>

  import { find } from 'lodash'
  import locallyStored from '~/plugins/locallyStored'

  export default {

    data() {
      return {
        name: null,
        id: null
      }
    },

    mixins: [ locallyStored('builder', {
      path: ['project']
    })]

  }

</script>

<style>

</style>