<template>
  <li>

    <template v-if="node.id">

      <a class="me-1 nocolor" href="#"
        v-if="node.hasChildren"
        v-text="node.collapsed ? '⊞' : '⊟'"
        @click="goToggle"
      />

      <a class="nocolor" href="#"
        v-text="node.text || node.id"
        @click="node.nudge()"
      />

      <a class="ms-3 nocolor" href="#"
        @click="goRemove"
        v-text="'×'"
      />
    </template>


    <div>
      <a class="nocolor" href="#"
        @click="goAddChild()"
        v-text="'…'"
      />
    </div>

    <transition name="node"
      @before-enter="log('enter (node)')"
      @before-leave="log('leave (node)')"
    >
      <transition-group ref="list" name="node-group" tag="ul"
        v-show="!node.collapsed"
        @before-enter="log('enter (group)')"
        @before-leave="log('leave (group)')"
      >
        <TreeNode
          @descendantMounted="
            descendants = [...descendants, ...log($event)]
          "
          v-for="child in node.children" :key="child.id"
          v-bind="{ tree, node: child }"
        />
      </transition-group>
    </transition>

  </li>
</template>

<script>

  import { last, map, sum, sumBy } from 'lodash'
  import { ms } from '~/plugins/helpers.js'

  export default {

    props: {
      node: {},
      tree: {},
    },

    data() {
      return {
        descendants: [],
        hello: null
      }
    },

    mounted() {
      // let { node } = this
      this.$emit('descendantMounted', this)
      if ( !this.hasChildren ) {
        // this.$emit('descendantMounted', this)

        // Todo: Find a better way to calculate the height for each individual node before it's created
        if ( !this.$store.state.singleNodeHeight ) {
          this.$nextTick(() => this.store.singleNodeHeight = this.$el.offsetHeight)
        }

      }
    },

    methods: {

      goAddChild() {
        this.node.addChild()
        this.$nextTick(() => {
          // Todo: find a way to calculate individually
          this.store.nodeHeight = this.store.singleNodeHeight
        })
      },

      goRemove() {
        this.log(this.store.nodeHeight = this.$el.offsetHeight)
        this.node.remove()
      },

      goToggle() {

        let { store, node, $refs: { list: { $el: { offsetHeight } = {}} = {}} = {}} = this
        ms('toggling', true)
        if ( !node.collapsed ) {
          store.nodeHeight = offsetHeight
          node.toggle()
        } else {
          node.toggle()
          ms('toggled')
          this.$nextTick(() => {
            ms('next tick')
            this.log(store.nodeHeight = sum(this.log(map(this.log(this.descendants), '$el.offsetHeight'))))
            ms('height calculated')
          })
        }
      },

      ms
    }


  }

</script>

<style scoped>

  li::marker {
    display: none;
  }

</style>