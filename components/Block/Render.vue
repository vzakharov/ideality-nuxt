<template>
  <div>
    <Block 
      v-for="({type, content}) in blocks" :key="type"
      v-bind="{type, content}"
    />
  </div>
</template>

<script>

  export default {

    props: ['content'],

    data() {

      let { content } = this
      const pattern = /== (?<type>.*) ==\n\n(?<content>[\s\S]*?)(?=\n\n==|$)/g
      let blocks = []
      let match
      while ( match = pattern.exec(content) ) {
        blocks.push(match.groups)
      }

      return {
        blocks
      }

    }

  }

</script>

<style>

</style>