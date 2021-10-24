<template>
  <WidgetProper v-bind="{widget}"/>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  export default {

    asyncData({ params: { id }}) { 
      return new Bubble().get('widget', id)
    }

  }

</script>

<style>

</style>