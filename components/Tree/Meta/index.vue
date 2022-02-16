<template>
  <TreeMetaNode v-bind="{ node: tree.root, tree }" v-on="$listeners"/>
</template>

<script>

  import { find, without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties, Meta } from '~/plugins/helpers.js'

  export default {
    
    props: [ 'tree' ],
    
    mixins: [
      Meta('tree', { 
        
        computed: {

          nodes() { return [ this.root, ...this.root.descendants ]},

          node({ nodes, current_node_id: id, root } = this ) { 
            return find(nodes, { id }) || root 
          }

        },

        methods: {
          

        },

        defaults: {
          root: { id: 0, created: new Date() },
          current_node_id: 0,
          max_id: 0,
          editing: true
        }

      })
    ],


}
  
</script>