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
    <Loading v-else message="Checking the code, one sec..."/>
  </div>
</template>

<script>

  import { find } from 'lodash'

  export default {

    data() {
      return {
        ok: false,
        loaded: false,
        builds: null
      }
    },

    async mounted() {
      this.syncLocal('builds')

      let { route: { params }} = this
      try {
        let { id } = await this.bubble.go('confirmBuildRequest_v2', params)
        let build = find(this.builds, { id })
        this.setFieldsFor(build, params)
        this.ok = true
      } catch(e) {
      } finally {
        this.loaded = true
      }
      
    }

  }

</script>