<template>
  <nuxt-link class="nocolor"
    :to="{hash: '#' + node.id }"
    v-html="escape(node.text).replace(/\n/g, '<br>')"
  />
</template>

<script>

  import { escape } from 'lodash'

  export default {
    
    props: ['node', 'text'],
    
    methods: { escape }

  }

</script>