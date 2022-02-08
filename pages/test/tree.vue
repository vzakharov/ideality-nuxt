<template>
  <div v-if="mounted">
    <TreeParse v-bind="{tree}"/>

    <ul style="list-style-type:none">
      <TreeNode v-bind="{ tree, node: tree.root }"/>
    </ul>

   
  </div>
</template>

<script>

  import { repeat } from 'lodash'

  export default {

    data() {

      return {
        items: [1,2,3,4,5,6,7,8,9],
        nextNum: 10,
        tree: {
          root:
            { 
              id: '0',
              created: new Date()
            }
        }
      }

    },

    mounted() {
      this.syncLocal('writer', { select: ['tree'], inline: true })
    },

    methods: {
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