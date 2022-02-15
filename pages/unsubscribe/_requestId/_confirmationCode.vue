<template>
  <MyFetch v-bind="{
    messages: {
      pending: 'Checking the code, one sec...',
      ok: 'Thank you, you have been unsubscribed.',
      error: 'Oops, the confirmation code seems incorrect. Please check your mailbox and try again.',
    },
    mounted
  }"/>
</template>

<script>

  import { find } from 'lodash'

  export default {

    data() {
      return {
        builds: null
      }
    },

    methods: {

      async mounted() {
        this.syncLocal('builds')

        let { route: { params }} = this
        try {
          let id = await this.bubble.go('cancelBuildRequest', params)
          let build = find(this.builds, { id })
          build && this.assignReactive(build, params)
        } catch(error) {
          if ( error.statusCode != 400 )
            throw(error)
        }
      }

    }

  }

</script>