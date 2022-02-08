<template>
  <component :is="'template'">
    <TreeParse v-for="child in node.children" :key="child.id" :node="child" :parent="node"/>
  </component>
</template>

<script>

  import { without } from 'lodash'

  export default {

    props: [ 'node', 'parent' ],

    created() {

      let { node } = this

      Object.defineProperties(node, {

        parent: { get: () => this.parent },
        siblings: { get: () => without(node.parent?.children, node) },
        hello: { get: () => 'world' }

      })

    }

  }
  
</script>

<style>

</style>