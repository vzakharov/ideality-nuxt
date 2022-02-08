<template>
  <TreeParseNode v-bind="{ node: tree.root, tree }" v-on="$listeners"/>
</template>

<script>

  import { without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties } from '~/plugins/helpers.js'

  export default {

    props: [ 'tree' ],

    created() {

      let { tree, tree: { root }} = this


      assignProperties(tree, {

        nodes: () => [ root, ...root.descendants ]

      })   
    }

}
  
</script>