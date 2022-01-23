<!-- Not used currently, but the idea is to have something that looks like a link but actually just updates some internal data (and the displayed url too) -->
<template>
  <a :href="updatedUrl" @click.prevent="updateRoute">
    <slot/>
  </a>
</template>

<script>

  import { omit } from 'lodash'

  export default {

    props: ['to', 'replace'],

    computed: {

      updatedRoute() {
        return omit(this.$router.resolve(this.updatedTarget).route, ['matched'])
      },

      updatedTarget() {
        return this.appendedTarget(this.to)
      },

      updatedUrl() {
        return this.updatedRoute.path
      }

    },

    methods: {

      updateRoute() {
        let { updatedUrl, replace, updatedRoute: route } = this
        window.history[replace ? 'replaceState' : 'pushState'](
          null, null, updatedUrl
        )
        this.$store.commit('set', { route })
      }

    }

  }

</script>