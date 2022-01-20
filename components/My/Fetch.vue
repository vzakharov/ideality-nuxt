<template>
  <div>
    <div v-if="loaded">
      <b-alert show v-if="ok" variant="success" v-text="messages.ok"/>
      <b-alert show v-else variant="danger" v-text="messages.error"/>
    </div>
    <Loading v-else :message="messages.pending"/>
  </div>
</template>

<script>

  export default {

    props: ['messages', 'fetch'],

    data() {
      return {
        ok: false,
        loaded: false
      }
    },

    async mounted() {
      try {
        await this.fetch()
        this.ok = true
      } catch(error) {
        console.error(error)
      } finally {
        this.loaded = true
      }
    }

  }

</script>