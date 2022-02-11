<template>
  <div v-if="mounted">
    <TreeMeta v-bind="{tree}" v-on="{parsed}"/>

    <b-container fluid v-if="parsed_root">
      <b-row>
        <b-col cols="12" sm="5" md="3" class="bg-light vh" style="overflow-x: auto">
          <TreeNode v-bind="{ tree, node: tree.root }"/>
        </b-col>
        <b-col>
          <template v-if="node">
            <span v-for="node in node.ancestors" :key="node.id" v-text="node.text"/>
            <MyInput
              v-model="node.text"
            />
            <span v-for="node in node.heirs" :key="node.id" v-text="node.text"/>
          </template>
          <Loading v-else message="Processing, please wait"/>
        </b-col>
      </b-row>
    </b-container>
   
  </div>
</template>

<script>

  import { find, repeat } from 'lodash'

  export default {

    data() {

      // let parsed = {
      //   resolve: () => {}
      // }
      // parsed.promise = new Promise(resolve => Object.assign(parsed, { resolve }))

      return {
        items: [1,2,3,4,5,6,7,8,9],
        nextNum: 10,
        tree: {
          max_id: 0,
          root:
            { 
              id: 0,
              created: new Date()
            }
        },
        parsed_root: null,
        parsed_tree: null
        // parsed
      }

    },

    mounted() {
      this.syncLocal('studio', { select: ['tree'], inline: true })
    },

    computed: {

      node() { return this.tree.node }

    },

    methods: {

      parsed(parsed_root) {
        Object.assign(this, { parsed_root })
        // let id = this.hashRoute
        // if ( id ) {
        //   id = parseInt(id)
        //   find(this.tree.nodes, { id }).nudge()
        // }
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