<template>
  <b-container>
    <WidgetProper box v-bind="{widget}"/>
  </b-container>
</template>

<script>

  import Bubble from '@/plugins/bubble'
  import { get } from 'lodash'

  export default {
    
    head() { return this.widgetHeader },

    asyncData: Bubble.asyncData('widget'),

  }

</script>

<style>

</style>