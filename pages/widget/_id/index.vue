<template>
  <WidgetBox>
    <WidgetProper v-bind="{widget}"/>
  </WidgetBox>
</template>

<script>

  import Bubble from '@/plugins/bubble'
  import { get } from 'lodash'

  export default {
    
    head() { return this.head },

    asyncData: Bubble.asyncData('widget'),

    computed: {
      header() {
        let { widget } = this
        if ( widget ) {
          let { name: title, description } = widget
          return {
            title, description 
          }
        }
      }

    }

  }

</script>

<style>

</style>