<template>
  <div>
    {{ widget.name }}
  </div>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  export default {

    async asyncData() {

      const bubble = Bubble()

      return {
        bubble,
        widget: await bubble.get('widget', '1634290102528x190392032750235070')
      }

    }

  }

</script>

<style>

</style>