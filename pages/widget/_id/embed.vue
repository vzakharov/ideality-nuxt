<template>
  <WidgetProper v-bind="{widget}"/>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  export default {

    head() { 
      let { adsenseId } = this.$route.query
      
      let script = adsenseId && [
        {
          src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${adsenseId}`,
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