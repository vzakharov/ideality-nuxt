<template>
  <component :is="tag"
    ref="me"
    :contenteditable="editable"
    v-text="initialContent"
    :data-ph="!focused && placeholder"
    :class="{
      'text-muted': !initialContent,
      'border-start border-dark': focused && !value && blink
    }"
    @input="$emit('input', $event.target.innerText.replace('\xa0', ' '))"
    @focus="focused=true"
    @blur="focused=false; initialContent=value"
    :style="{
      display: 'inline',
      outline: 'none',
      'white-space': 'pre-wrap'
    }"
  />
</template>

<script>

  import { escape } from 'lodash'

  export default {

    props: {
      value: {},
      tag: {
        default: 'span'
      },
      placeholder: {
        default: '…'
      },
      editable: {
        default: true
      }
    },

    data() {
      return {
        initialContent: this.value,
        blink: null,
        blinkInterval: null,
        focused: null
      }
    },

    mounted() {

      this.$watch('value', { immediate: true, handler(value) {
        !value 
          ? this.blinkInterval = setInterval(() => this.toggle('blink'), 500)
          : clearInterval(this.blinkInterval)
      }})

      this.$once('hook:beforeDestroy', () => clearInterval(this.blinkInterval))

    },

    watch: {
      value(value) {
        if ( value != this.$refs.me.innerText )
          this.initialContent = value
      }
    },

    methods: {
      escape
    },

  }

</script>

<style scoped>
  [contenteditable=true]:empty::after{
    content:attr(data-ph);
    color:#bbb;
  }
</style>