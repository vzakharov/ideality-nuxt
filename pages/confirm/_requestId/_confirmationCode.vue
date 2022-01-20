<template>
  <MyFetch v-bind="{
    messages: {
      pending: 'Checking, please wait...',
      ok: 'Thank you, your email is confirmed! You can safely close the tab.',
      error: 'Oops, something went wrong. Please follow the link in your mailbox to unsubscribe.'
    },
    fetch
  }"/>
</template>

<script>

  import { reject } from 'lodash'

  export default {

    data() {
      return {
        builds: null
      }
    },

    methods: {

      async fetch() {
        this.syncLocal('builds')

        let { route: { params }} = this
        let id = await this.bubble.go('cancelBuildRequest', params)
        this.builds = reject(this.builds, { id })
      }

    }

  }

</script>