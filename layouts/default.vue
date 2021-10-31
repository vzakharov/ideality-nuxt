<template>
  <Nuxt />
</template>

<script>
import image from '~/static/image.png'

export default {
  head() {
    return {
      meta: [
        { hid: 'og:image', name: 'og:image', content: this.BASE_URL + image}      
      ]
    }
  }
}

</script>

<style>
a {
  text-decoration: none;
}
</style>