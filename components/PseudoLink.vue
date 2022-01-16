<!-- Not used currently, but the idea is to have something that looks like a link but actually just updates some internal data (and the displayed url too) -->
<template>
  <a :href="updatedUrl" @click.prevent="updateRoute">
    <slot/>
  </a>
</template>

<script>

  import { pick } from 'lodash'

  export default {

    props: ['to', 'replace'],

    computed: {

      updatedTarget() {
        return this.appendedTarget(this.to)
      },

      updatedUrl() {
        return this.$router.resolve(this.updatedTarget).href
      }

    },

    methods: {

      updateRoute() {
        let { updatedUrl, replace, updatedTarget } = this
        window.history[replace ? 'replaceState' : 'pushState'](
          null, null, updatedUrl
        )
        this.$store.commit('set', { route: pick(updatedTarget, ['params', 'query', 'hash']) })
      }

    }

  }

</script>