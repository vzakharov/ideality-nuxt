<template>
  <a :href="updatedUrl" @click.prevent="updateRoute">
    <slot/>
  </a>
</template>

<script>

  export default {

    props: ['append', 'replace'],

    computed: {

      updatedRoute() {
        return this.appendRoute(this.append)
      },

      updatedUrl() {
        return this.$router.resolve(this.updatedRoute).href
      }

    },

    methods: {

      updateRoute() {
        let { updatedUrl, replace, updatedRoute } = this
        window.history[replace ? 'replaceState' : 'pushState'](
          null, null, updatedUrl
        )
        this.$store.commit('set', { updatedRoute })
      }

    }

  }

</script>