<template>
  <div :id="node.id" class="ms-1 ps-1 border-start border-top">

    <template v-if="node.id">

      <a class="me-1 nocolor" href="#"
        v-if="node.hasChildren"
        v-text="node.collapsed ? '⊞' : '⊟'"
        @click="goToggle"
      />

      <div 
        style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width:200px"
        :class="tree.node && tree.node.thread && { 
          'gray': !tree.node.thread.includes(node),
          'fw-bold': tree.node == node && tree.focused,
          'fst-italic': !node.text,
          'd-inline-block': true
        }"
      >
        <nuxt-link class="nocolor small" 
          v-text="node.text || '#'+ node.id"
          :to="{ hash: '#' + node.id }"
        />
      </div>

      <a class="ms-3 nocolor" href="#"
        @click="remove"
        v-text="'×'"
      />
    </template>


    <div>
      <a class="gray" href="#"
        @click.prevent="addChild()"
        v-text="'⌞'"
      />
    </div>

    <transition name="node"
      @before-enter="log('enter (node)')"
      @before-leave="log('leave (node)')"
    >
      <transition-group ref="list" name="node-group" tag="div"
        v-show="!node.collapsed"
        @before-enter="log('enter (group)')"
        @before-leave="log('leave (group)')"
        @after-enter="transition.resolve()"
      >
        <TreeNode
          @descendantMounted="
            descendants = [...descendants, ...log($event)]
          "
          v-for="child in orderBy(node.children, 'created', 'desc')" :key="child.id"
          v-bind="{ tree, node: child }"
        />
      </transition-group>
    </transition>

  </div>
</template>

<script>

  import { last, map, sum, sumBy, orderBy } from 'lodash'
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

      orderBy,

      async addChild() {
        await this.transition.waitAndStart()
        let child = await this.node.addChild()
        this.$nextTick(async () => {
          // Todo: find a way to calculate individually
          this.store.nodeHeight = this.store.singleNodeHeight
          await this.transition.promise
          this.$router.push({ hash: '#' + child.id })
        })
      },

      remove() {
        this.store.nodeHeight = this.$el.offsetHeight
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

<style>


</style>