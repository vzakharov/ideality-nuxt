<template>
  <TreeParseNode v-bind="{ node: tree.root, tree: vm }" v-on="$listeners"/>
</template>

<script>

  import { find, without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties, Internalize } from '~/plugins/helpers.js'

  export default {

    mixins: [
      Internalize('tree', 'current_node_id max_id'.split(' '))
    ],

    props: [ 'tree' ],

    // created() {

    //   let { tree, tree: { root }} = this


    //   assignProperties(tree, {

    //     nodes: () => [ root, ...root.descendants ]

    //   })   
    // },

    computed: {

      root() { return this.$children[0] },

      nodes({ root } = this) { return [ root, ...root.descendants ]},

      node({ nodes, current_node_id: id, root } = this ) { 
        return find(nodes, { id }) || root 
      }

    }

}
  
</script>