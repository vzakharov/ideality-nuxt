<template>
  <component :is="tag"
    :contenteditable="editable"
    v-html="value && value.replace(/\n/g, '<br/>')"
    :data-ph="placeholder"
    :class="{'text-muted': !currentContent}"
    @input="currentContent=$event.target.innerText"
    @blur="$emit('input', currentContent)"
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
        currentContent: this.value
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