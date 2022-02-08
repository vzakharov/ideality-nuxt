<template>
  <TreeParseNode v-bind="{ node: tree.root, tree }"/>
</template>

<script>

  import { without, uniqueId } from 'lodash'
  import { encode } from 'dahnencode'
  import { assignMethods, assignProperties } from '~/plugins/helpers.js'

  export default {

    props: [ 'tree' ],

    created() {

      let { tree } = this


      assignProperties(tree, {

        nodes: () => tree.root.descendants

      })   
    }

}
  
</script>