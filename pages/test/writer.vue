<template>
  <div>
    <TreeNode v-bind="{ tree, node: tree.nodes[0] }"/>
  </div>
</template>

<script>

  export default {

    data() {

      return {
        tree: {
          nodes: [
            { id: 0 }
          ]
        }
      }

    },

    mounted() {
      this.syncLocal('writer', { select: ['tree'], inline: true })
    }

  }

</script>

<style>

</style>