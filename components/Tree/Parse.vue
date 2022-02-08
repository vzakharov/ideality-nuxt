<template>
  <component :is="'template'">
    <TreeParse v-for="child in node.children" :key="child.id" :node="child" :parent="node"/>
  </component>
</template>

<script>

  import { without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties } from '~/plugins/helpers.js'

  export default {

    props: [ 'node', 'parent' ],

    created() {

      let { node, parent } = this

      let vm = this

      assignProperties(node, {

        // Getters

        parent,

        siblings: () => without(parent?.children, node),

        root: parent ? parent.root : node,

        isRoot: !parent,

        // Methods

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
            ...node.children || [],
            child
          ])

          return child

        },

        nudge() {

          let { parent } = node
          if ( parent ) {
            parent.children = [ node, ...node.siblings ]
            parent.nudge()
          }

        } 

      }
)


    }

  }
  
</script>

<style>

</style>