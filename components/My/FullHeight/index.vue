<template>
  <component :is="tag" v-bind="$props"
    :style="`height: calc(100vh - ${top}px)`"
  >
    <slot/>
  </component>
</template>

<script>
  export default {
    props: ['tag', 'align-v'],
    
    data() {
      return {
        top: 0
      }
    },

    mounted() {
      this.top = this.$el.offsetTop
    }

  }
</script>