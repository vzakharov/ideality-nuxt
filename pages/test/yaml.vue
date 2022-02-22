<template>
  <CodeInput :value="dump(object)"/>
</template>

<script>

  import { dump } from 'js-yaml'

  export default {

    computed: {
      object() {
        let a = { b:1 }
        return {
          parameters: [a,1],
          hello: 'world',
          array: [a,2,3]
        }
      }
    },

    methods: {
      dump
    }

  }

</script>

<style>

</style>