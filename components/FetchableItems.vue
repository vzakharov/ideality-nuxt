<template>
  <div>
    <div v-if="items">
      <b-dropdown-item v-for='item in items' :key='item._id'>
        <nuxt-link class="text-decoration-none text-body" :to="{...$route, name: `${type}-id-config`, params: {id: item.Slug || item._id}}">
          {{ item.name || item._id }}
        </nuxt-link>
      </b-dropdown-item>
    </div>
    <div v-else class="m-2">
      Loading {{ type }}s... <b-spinner small/> 
    </div>
  </div>
</template>

<script>

  export default {

    props: ['type'],

    data () { return {
      items: null
    }},

    async fetch() {
      if (!this.$auth.loggedIn)
      return false
      let response = await (
        await fetch(`https://b.ideality.app/api/1.1/obj/${this.type}/`, {
          headers: {
            'Authorization': this.$auth.strategy.token.get(),
            'Content-Type': 'application/json'
          }
        })
      ).json()
      this.items = response.response.results
    }

  }

</script>

<style>

</style>