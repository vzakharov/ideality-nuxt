<template>
  <component :is="'template'">
    <TreeMetaNode v-for="child in node.children" :key="child.id" 
      v-bind="{
        node: child,
        parent: node,
        tree
      }"
      @parsed="!--leftToParse && emit_parsed"
    />
  </component>
</template>

<script>

  import { NodeMixin } from '~/plugins/tree.js'
  import { assignProperties, Meta, objectify } from '~/plugins/helpers.js'

  export default {

    props: [ 'node', 'tree', 'parent' ],

    mixins: [ 
      NodeMixin
    ],

    data() {

      return {
        leftToParse: this.node.children?.length || 0
      }

    },

    mounted() {
      if ( !this.leftToParse )
        this.emit_parsed()
    },

    methods: {

      emit_parsed() {
        // console.log('parsed', this.node.id)
        this.$emit('parsed', this)
      }

    }

  }
  
</script>

<style>

</style>