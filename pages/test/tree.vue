<template>
  <div v-if="mounted">
    <!-- <div id="list-complete-demo" class="demo">
      <button v-on:click="shuffle">Shuffle</button>
      <button v-on:click="add">Add</button>
      <button v-on:click="remove">Remove</button>
      <transition-group name="list-complete" tag="p">
        <div
          v-for="{ node } in orderNodes(tree.nodes[0])"
          v-bind:key="node.id"
        >
          {{ node.id }}
        </div>
      </transition-group>
    </div> -->

    <ul style="list-style-type:none">
      <TreeNode v-bind="{ tree, node: tree.nodes[0] }"/>
    </ul>

      
      <!-- <transition-group name="slide-down" v-if="mounted" tag="div">
        <div v-for="{node, depth} in orderNodes(tree.nodes[0])" :key="node.id">
        
        {{ repeat('-', depth) }} 

        <b-icon-arrow-up
          @click="nudge(node)"
        />

        <b-icon-plus-circle
          @click="addChild(node)"
        />

        <b-icon class="me-1"
          v-if="log('children', getChildren(log('node', node))).length" :icon="node.collapsed ? 'chevron-double-down' : 'chevron-double-up'"
          @click="toggle(node)"
        />

        {{ node.id }}

        <b-icon-x-circle class="ms-3"
          @click="destroy(node)"
        />

      </div>
    </transition-group> -->
   
  </div>
</template>

<script>

  import treeMethods from '~/plugins/tree.js'
  import { repeat } from 'lodash'

  export default {

    data() {

      return {
        items: [1,2,3,4,5,6,7,8,9],
        nextNum: 10,
        tree: {
          nodes: [
            { 
              id: 0,
              created: new Date()
            }
          ]
        }
      }

    },

    mounted() {
      this.syncLocal('writer', { select: ['tree'], inline: true })
    },

    methods: {
      ...treeMethods,
      repeat,
      randomIndex: function () {
        return Math.floor(Math.random() * this.items.length)
      },
      add: function () {
        this.items.splice(this.randomIndex(), 0, this.nextNum++)
      },
      remove: function () {
        this.items.splice(this.randomIndex(), 1)
      },
      shuffle: function () {
        this.items = _.shuffle(this.items)
      }
    }


  }

</script>

<style>
.list-complete-move {
  transition: all 1s;
}
.list-complete-enter, .list-complete-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
.list-complete-leave-active {
  position: absolute;
}
</style>