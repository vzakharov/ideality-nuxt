<template>
    <div contenteditable
      @input="process"
      :style="{
        outline: 'none',
        'white-space': 'pre-wrap'
      }"
    >
      <span :id="idfy(item.id)" v-for="item in clonedItems" :key="item.id" v-text="item.text"/>
    </div>  
</template>

<script>

  import { jsonClone } from '~/plugins/helpers.js'

  export default {

    props: ['items'],

    data() {
      return {
        clonedItems: jsonClone(this.items)
      }
    },

    methods: {

      idfy: id => 'span-'+id,

      process() {

        for ( let item of this.items ) {
          item.text=document.getElementById(this.idfy(item.id))?.innerText
        }

      }      

    }

  }

</script>

<style>

</style>