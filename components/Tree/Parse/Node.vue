<template>
  <component :is="'template'">
    <TreeParseNode v-for="child in node.children" :key="child.id" 
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

  import { TreeNode } from '~/plugins/tree.js'

  export default {

    props: [ 'node', 'parent', 'tree' ],

    data() {

      return {
        leftToParse: this.node.children?.length || 0
      }

    },

    created() {

      let { node } = this 
      if ( this.log(node.constructor.name) != 'TreeNode' )
        TreeNode.call(node, this)

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