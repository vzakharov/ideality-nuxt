<template>
  <component :is="'template'">
    <TreeParseNode v-for="child in node.children" :key="child.id" 
      v-bind="{
        node: child,
        tree,
        root
      }"
      @parsed="!--leftToParse && emit_parsed"
    />
  </component>
</template>

<script>

  import { NodeMixin } from '~/plugins/tree.js'
  import { Internalize, objectify } from '~/plugins/helpers.js'

  export default {

    props: {
      ...objectify([ 'node', 'tree' ]),
      root: {
        default() { return this.tree.root }
      }
    },

    mixins: [ 
      Internalize('node', 'collapsed created id text'.split(' ')),
      NodeMixin
    ],

    data() {

      return {
        leftToParse: this.node.children?.length || 0,
        isTreeNode: true
      }

    },

    created() {

      // let { node } = this 
      // if ( node.constructor.name != 'TreeNode' )
      //   TreeNode.call(node, this)

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