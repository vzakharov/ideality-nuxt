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

  export default {

    head() { 
      let { adsenseId } = this.$route.query

      let script = adsenseId && [
        {
          src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${adsenseId}`,
          async: true,
          crossorigin: 'anonymous'
        }
      ]

      return {
        script
      }
    },

    asyncData: Bubble.asyncData('widget')

  }

</script>

<style>

</style>