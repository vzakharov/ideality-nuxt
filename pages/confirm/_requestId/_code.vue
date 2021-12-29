<template>
  <div>
    <div v-if="loaded">
      <b-alert show v-if="ok" variant="success">
        Thank you, your email is confirmed! You can safely close the tab.
      </b-alert>
      <b-alert show v-else variant="danger">
        Oops, the confirmation code seems incorrect. Please check your mailbox and try again.
      </b-alert>
    </div>
  </div>
</template>

<script>
  export default {

    data() {
      return {
        ok: false,
        loaded: false
      }
    },

    async fetch({ $route: { params }} = this) {
      let ok
      try {
        await this.bubble.go('confirmBuildRequest', params)
        this.ok = true
      } catch(e) {
      } finally {
        this.loaded = true
      }
      
    }

  }

</script>

<style>

</style>