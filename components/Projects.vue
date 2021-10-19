<template>
  <div>
    <b-dropdown-item v-for='project in projects' :key='project._id' @click="$emit('openProject', project)">
      {{ project.name || project._id }}
    </b-dropdown-item>
  </div>
</template>

<script>

  export default {

    data () { return {
      projects: []
    }},

    async fetch() {
      if (!this.$auth.loggedIn)
      return false
      let response = await (
        await fetch(`https://ideality.app/version-test/api/1.1/obj/project/`, {
          headers: {
            'Authorization': this.$auth.strategy.token.get(),
            'Content-Type': 'application/json'
          }
        })
      ).json()
      this.projects = response.response.results
    }

  }

</script>

<style>

</style>