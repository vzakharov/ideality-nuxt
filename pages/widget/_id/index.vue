<template>
  <b-container>
    <Widget box class="mt-5" v-bind="{widget}"/>
  </b-container>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  export default {
    
    head() { return this.widgetHeader },

    asyncData: Bubble.asyncData('widget'),

  }

</script>