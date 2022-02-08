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

  import { map, max, without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties } from '~/plugins/helpers.js'

  export default {

    props: [ 'node', 'parent', 'tree' ],

    data() {

      return {
        leftToParse: this.node.children?.length || 0
      }

    },

    created() {

      let { node, parent, tree } = this

      let vm = this

      assignProperties(node, {

        parent, tree,

        ancestors: () => parent ? [ ...parent.ancestors, parent ] : [],

        descendants: () => node.children?.map( child =>
          [ child, ...child.descendants || [] ]
        ).flat() || [],

        hasChildren: () => node.children?.length,

        hasSiblings: () => node.siblings?.length,

        heirs: () => node.hasChildren ? [ node.children[0], ...node.children[0].heirs ] : [],

        isHeir: () => parent.children[0] == node,

        isRoot: () => !parent,

        siblings: () => without(parent?.children, node),

        root: () => node.isRoot ? node : parent.root,

        thread: () => [...node.ancestors, node, ...node.heirs]

      })

      assignMethods(node, {

        addChild() {

          let child = {
            id: max([
              tree.max_id,
              max(map(tree.nodes, 'id'))
            ]) + 1,
            created: new Date()
            // nudged: new Date(),
            // collapsed: false
          }

          vm.$set(tree, 'max_id', child.id)

          vm.$set(node, 'children', [
            child,
            ...node.children || []
          ])

          vm.$router.push({ hash: '#' + child.id})

          return child

        },

        nudge() {

          let { parent } = node
          if ( parent ) {
            parent.children = [ node, ...node.siblings ]
            parent.nudge()
          }

        },

        remove() {
          parent.children = vm.log(without(parent.children, node))
        },

        toggle() {
          vm.$set(node, 'collapsed', !node.collapsed)
        }

      }
)

    },

    mounted() {
      if ( !this.leftToParse )
        this.emit_parsed()
    },

    methods: {

      emit_parsed() {
        console.log('parsed', this.node.id)
        this.$emit('parsed', this)
      }

    }

  }
  
</script>

<style>

</style>