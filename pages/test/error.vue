<template>
  <b-button @click.prevent="doBad" v-text="'Throw'"/>
</template>

<script>

  export default {

    methods: {
      async doBad() {
        try {
          await this.$axios.post('api/error')
        } catch(error) {
          window.alert(error)
        }
      }
    }

  }

</script>

<style>

</style>