<template>
  <component :is="tag"
    contenteditable 
    v-text="value"
    :data-ph="placeholder"
    :class="{'text-muted': !currentContent}"
    @input="currentContent=$event.target.innerText.replace(/\n/g, '')"
    @blur="$emit('input', currentContent)"
  />
</template>

<script>

  export default {

    props: {
      value: {},
      tag: {
        default: 'span'
      },
      placeholder: {
        default: 'type something...'
      }
    },

    data() {
      return {
        currentContent: this.value
      }
    }

  }

</script>

<style scoped>
  [contenteditable=true]:empty::before{
    content:attr(data-ph)
  }
</style>