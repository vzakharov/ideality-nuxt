<template>
  <div>
    <small v-for="(crumb, i) in crumbs" :key="partialPath(i)">
      <span v-if="i" v-text="' / '"/>
      <nuxt-link :to="partialPath(i)" v-text="full[crumb] || crumb || '▲' "/>
    </small>
  </div>
</template>

<script>

  export default {

    props: ['noHome'],

    data() {
      return {
        full: {
          i: 'ideas'
        }
      }
    },

    computed: {

      path() {
        return this.route.path
      },

      crumbs() {
        return this.path.split('/').slice(this.prop('noHome') ? 1 : 0)
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