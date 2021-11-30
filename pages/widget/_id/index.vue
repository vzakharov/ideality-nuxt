<template>
  <WidgetBox>
    <WidgetProper v-bind="{widget}"/>
  </WidgetBox>
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