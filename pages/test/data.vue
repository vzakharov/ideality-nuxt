<template>
  <div v-text="text"/>
</template>

<script>
  export default {
    data() {
      return {
        text: 'hello'
      }
    },

    mounted() {
      let $data = {text: 'world'}
      // Tested: doesn't work
      Object.assign(this, { $data })
    }
  }

</script>