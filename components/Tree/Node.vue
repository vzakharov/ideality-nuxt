<template>
  <li>

    <template v-if="node.id">

      <a class="me-1 nocolor" href="#"
        v-if="hasChildren(node)"
        v-text="node.collapsed ? '⊞' : '⊟'"
        @click="doWithNode(toggle)"
      />

      <a class="nocolor" href="#"
        v-text="node.text || node.id"
        @click="nudge(node)"
      />

      <a class="ms-3 nocolor" href="#"
        @click="destroy(node)"
        v-text="'×'"
      />
    </template>


    <div>
      <a class="nocolor" href="#"
        @click="addChild(node)"
        v-text="'…'"
      />
    </div>

    <transition name="slide-down"
    >
      <transition-group ref="list" name="slide-down" tag="ul"
        v-if="hasChildren(node) && !node.collapsed"
      >
        <TreeNode
          @created="childHeight = 0"
          @mounted="log('mounted', childHeight += $event.$el.offsetHeight)"
          v-for="child in getChildren(node)" :key="child.id"
          v-bind="{ tree, node: child }"
        />
      </transition-group>
    </transition>

  </li>
</template>

<script>

  import { sumBy } from 'lodash'
  import treeMethods from '~/plugins/tree.js'
  import beacon from '~/plugins/mixins/beacon.js'

  console.log({beacon})
  
  export default {

    mixins: [ beacon ],

    props: {
      node: {},
      tree: {},
    },

    computed: {

      heightListeners() { 
        return {
          'before-enter': element => this.recalculateHeight(element),
          'before-leave': element => this.recalculateHeight(element)
        }
      }

    },

    methods: {

      doWithNode(what) {
        what(this.node)
        this.store.nodeHeight = this.childHeight
      },

      recalculateHeight(element) {
        this.$nextTick(() => this.log(
          this.store.nodeHeight = sumBy(Array.from(element.children), 'offsetHeight')
        ))
      },

      sumBy,

      ...treeMethods
    }


  }

</script>

<style scoped>

  li::marker {
    display: none;
  }

</style>