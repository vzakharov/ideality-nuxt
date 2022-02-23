<template>
  <div>
    <div contenteditable
      @input="process"
    >
      <span :id="item.id" v-for="item in clonedItems" :key="item.id" v-text="item.text"/>
    </div>
    {{ items }}
  </div>
</template>

<script>

  import { jsonClone } from '~/plugins/helpers.js'
  
  export default {

    data() {

      let items = [
          { id: 1, text: 'Hello' },
          { id: 2, text: ' world' },
          { id: 3, text: '!' }
        ]

      return {
        items,
        clonedItems: jsonClone(items)
      }

    },

    methods: {

      process() {

        for ( let item of this.items ) {
          item.text=document.getElementById(item.id)?.innerText
        }

      }

    }

  }

</script>

<style>

</style>