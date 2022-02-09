<template>
  <div class="ms-1 ps-1 border-start border-top">

    <template v-if="node.id">

      <a class="me-1 nocolor" href="#"
        v-if="node.hasChildren"
        v-text="node.collapsed ? '⊞' : '⊟'"
        @click="goToggle"
      />

      <span :class="{ 
        'gray': !tree.node.thread.includes(node),
        'fw-bold': tree.node == node
      }">
        <nuxt-link class="nocolor"
          v-text="node.text || node.id"
          :to="{ hash: '#' + node.id }"
          @click.native="node.nudge()"
        />
      </span>

      <a class="ms-3 nocolor" href="#"
        @click="remove"
        v-text="'×'"
      />
    </template>


    <div>
      <a class="nocolor" href="#"
        @click.prevent="addChild()"
        v-text="'…'"
      />
    </div>

    <transition name="node"
      @before-enter="log('enter (node)')"
      @before-leave="log('leave (node)')"
    >
      <transition-group ref="list" name="node-group" tag="div"
        v-show="!node.collapsed"
        @before-enter="log('enter (group)'); transition.start()"
        @before-leave="log('leave (group)')"
        @after-enter="transition.end()"
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

  </div>
</template>

<script>

  import { last, map, sum, sumBy } from 'lodash'
  import { Awaitable, ms } from '~/plugins/helpers.js'

  export default {

    props: {
      node: {},
      tree: {},
    },

    data() {
      return {
        descendants: [],
        transition: new Awaitable() 
      }
    },

    mounted() {
      // let { node } = this
      this.$emit('descendantMounted', this)
      if ( !this.node.hasChildren ) {
        // this.$emit('descendantMounted', this)

        // Todo: Find a better way to calculate the height for each individual node before it's created
        if ( !this.$store.state.singleNodeHeight ) {
          this.$nextTick(() => this.store.singleNodeHeight = this.$el.offsetHeight)
        }

      }
    },

    methods: {

      addChild() {
        let child = this.node.addChild()
        this.$nextTick(async () => {
          // Todo: find a way to calculate individually
          this.store.nodeHeight = this.store.singleNodeHeight
          await this.transition.done
          child.nudge()
        })
      },

      remove() {
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