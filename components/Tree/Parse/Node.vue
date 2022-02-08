<template>
  <component :is="'template'">
    <TreeParseNode v-for="child in node.children" :key="child.id" v-bind="{
      node: child,
      parent: node,
      tree
    }"/>
  </component>
</template>

<script>

  import { map, max, without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties } from '~/plugins/helpers.js'

  export default {

    props: [ 'node', 'parent', 'tree' ],

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

        isHeir: () => parent.children[0] == node,

        isRoot: () => !parent,

        siblings: () => without(parent?.children, node),

        root: () => node.isRoot ? node : parent.root,

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


    }

  }
  
</script>

<style>

</style>