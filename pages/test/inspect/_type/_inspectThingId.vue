<template>
  <div class="container-sm w-auto mx-auto my-3">
    <Inspect :_key="type" :value="thing" :expand="true" v-bind="{expandAll}"/>
  </div>
</template>

<script>

  import { get } from 'lodash'

  import Bubble from '@/plugins/bubble'

  export default {

    async asyncData({ $auth, route: { query: { expandAll }, params: { type, inspectThingId }}}) {


      const bubble = new Bubble({ token: $auth && $auth.strategy.token.get() })
      
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