<template>
  <div class="mb-3">
    <small v-for="(crumb, i) in crumbs" :key="partialPath(i)">
      <span v-if="i" v-text="' / '"/>
      <nuxt-link :to="partialPath(i)" v-text="crumb || '▲'"/>
    </small>
  </div>
</template>

<script>

  export default {

    data() {
      return {
        path: ''
      }
    },

    mounted() {
      this.path = window.location.pathname
    },

    computed: {

      crumbs() {
        return this.path.split('/')
      }

    },

    watch: {
      '$store.state.path': function(path) {
        Object.assign(this, {path})
      }
    },

    methods: {
      partialPath(i) { 
        return this.crumbs.slice(0, i+1).join('/') || '/'
      }
    }

  }

</script>

<style scoped>
a {
  text-decoration: none;
  color: gray;
}
</style>