<template>
  <ul>

    <b-icon class="me-1"
      v-if="children.length" :icon="node.collapsed ? 'chevron-double-down' : 'chevron-double-up'"
      @click="toggle(node)"
    />

    <span v-if="node.text" v-text="node.text"/>
    <em v-else v-text="node.id"/>

    <b-icon-x-circle class="ms-3"
      @click="destroy(node)"
    />

    <transition name="slide-down">
      <div v-if="!node.collapsed">
        <transition-group name="slide-down" tag="div">
          <li v-for="node in children" :key="node.id">
              <TreeNode v-bind="{ tree, node }"/>
          </li>
        </transition-group>
        <div>
          <b-icon-plus-circle
            @click="addChild(node)"
          />
        </div>
      </div>
    </transition>

  </ul>
</template>

<script>

  import treeMethods from '~/plugins/tree.js'

  console.log({treeMethods})
  
  export default {

    props: {
      node: {},
      tree: {},
    },

    computed: {
      children() { return this.getChildren(this.node) }
    },

    methods: {
      ...treeMethods
    }


  }

</script>

<style>

</style>