<template>
  <span>
    <span @click="goto(node)" style='white-space: pre-wrap'>{{ node.body || '[empty]' }}</span>
    <ul v-if="node.children && node.children.length > 1">
      <li v-for="child in node.children.filter(child => child != the.node)" :key="child.body.slice(0, 5)">
        <node-span :node='child' :the='the' @goto="goto"/>
      </li>
    </ul>
  </span>
</template>

<script>
export default {
  props: ['node', 'the'],
  methods: {
    goto(node) {
      this.$emit('goto', node)
    }
  },
  mounted() {
    debugger
  }
}
</script>