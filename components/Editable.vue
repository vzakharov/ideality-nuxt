<template>
  <component :is="tag"
    ref="me"
    :contenteditable="editable"
    v-text="initialContent"
    :data-ph="placeholder"
    :class="{'text-muted': !initialContent}"
    @input="$emit('input', $event.target.innerText.replace('\xa0', ' '))"
    @blur="initialContent=value"
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
        initialContent: this.value
      }
    },

    methods: {
      escape
    },

    watch: {
      value(value) {
        if ( value != this.$refs.me.innerText )
          this.initialContent = value
      }
    }

  }

</script>

<style scoped>
  [contenteditable=true]:empty::before{
    content:attr(data-ph)
  }
</style>