<template>
  <div>
    <WidgetBox v-if="queryTags.box">
      <WidgetProper v-bind="{widget}"/>
    </WidgetBox>
    <div v-else class="container-sm w-auto p-3 bg-light mx-auto" style="max-width: 800px">
      <WidgetProper v-bind="{widget}"/>
    </div>
  </div>
</template>

<script>

  import Bubble from '@/plugins/bubble'
  import { get } from 'lodash'

  export default {
    head() { return {
      title: `${get(this, 'widget.name') } 🔺 Ideality widget`
    }},

    asyncData: Bubble.asyncData('widget')

  }

</script>

<style>

</style>