<template>
  <div class="container-sm w-auto mx-auto my-3">
    <Inspect :_key="type" :value="thing" :expand="true" v-bind="{expandAll}"/>
  </div>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  export default {

    async asyncData({ route: { query: { expandAll }, params: { type, inspectThingId }}}) {

      const bubble = Bubble()
      
      if ( typeof expandAll === 'undefined' )
        expandAll = true

      return {
        bubble,
        type,
        thing: await bubble.get(type, inspectThingId),
        expandAll
      }

    }

  }

</script>

<style>

</style>