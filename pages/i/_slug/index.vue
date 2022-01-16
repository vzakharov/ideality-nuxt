<template>
  <div v-if="build">
    <Build v-bind="{build}"/>
  </div>
</template>

<script>

  export default {

    data() {

      return {
        build: null
      }

    },

    async fetch() {
      let build = this.route.params

      if ( !build.code )
        build = await this.bubble.get('build', this.route.params.slug)
      
      Object.assign(this, { build })
    } 

  }

</script>