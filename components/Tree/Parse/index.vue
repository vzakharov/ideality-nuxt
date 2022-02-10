<template>
  <TreeParseNode v-bind="{ node: root, tree }" v-on="$listeners"/>
</template>

<script>

  import { find, without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties, Internalize } from '~/plugins/helpers.js'

  export default {

    mixins: [
      Internalize(
        'tree', 
        'root current_node_id max_id'.split(' '), {
          computed: {

            nodes({ root } = this) { return [ root, ...root.descendants ]},

            node({ nodes, current_node_id: id, root } = this ) { 
              return find(nodes, { id }) || root 
            }

          }
        }
      )
    ],

    props: [ 'tree' ],

    // created() {

    //   let { tree, tree: { root }} = this


    //   assignProperties(tree, {

    //     nodes: () => [ root, ...root.descendants ]

    //   })   
    // },



}
  
</script>