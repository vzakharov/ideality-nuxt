<template>
  <component :is="'template'">
    <TreeParseNode v-for="child in node.children" :key="child.id" :node="child" :parent="node"/>
  </component>
</template>

<script>

  import { without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties } from '~/plugins/helpers.js'

  export default {

    props: [ 'node', 'parent', 'tree' ],

    created() {

      let { node, parent, tree } = this

      let vm = this

      assignProperties(node, {

        parent, tree,

        descendants: () => node.children?.map?.( child =>
          [ child, ...child.descendants || [] ]
        ).flat(),

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
            id: encode( ( Date.now() - new Date(node.root.created) + uniqueId() ) / 100 ),
            created: new Date()
            // nudged: new Date(),
            // collapsed: false
          }

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
          parent.children = without(parent.children, node)
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