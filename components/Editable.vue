<template>
  <component :is="tag"
    :contenteditable="editable"
    v-html="initialContent && initialContent.replace(/\n/g, '<br/>')"
    :data-ph="placeholder"
    :class="{'text-muted': !initialContent}"
    @input="$emit('input', $event.target.innerText)"
    @blur="initialContent=value"
    :style="{
      display: 'inline',
      outline: 'none'
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
    }

  }

</script>

<style scoped>
  [contenteditable=true]:empty::before{
    content:attr(data-ph)
  }
</style>