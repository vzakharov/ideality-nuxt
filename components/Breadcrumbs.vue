<template>
  <div class="mb-3">
    <small v-for="(crumb, i) in crumbs" :key="path(i)">
      <span v-if="i" v-text="' / '"/>
      <nuxt-link :to="path(i)" v-text="crumb || 'ideality'"/>
    </small>
  </div>
</template>

<script>

  export default {
    computed: {

      crumbs() {
        return window.location.pathname.split('/')
      }

    },

    methods: {
      path(i) { 
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