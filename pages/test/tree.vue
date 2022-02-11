<template>
  <div v-if="mounted">
    <TreeMeta v-bind="{tree}" @parsed="parsing.resolve()"/>

    <b-container fluid v-if="parsing.resolved">
      <b-row>
        <b-col cols="12" sm="5" md="3" class="bg-light vh" style="overflow-x: auto">
          <TreeNode v-bind="{ tree, node: tree.root }"/>
        </b-col>
        <b-col>
          <template v-if="node">
            <template v-for="node in node.thread">
              <StudioSpan v-if="node != tree.node" :key="node.id" v-bind="{node}"/>
              <MyInput v-else :key="node.id"
                v-model="node.text"
              />
            </template>
          </template>
          <Loading v-else message="Processing, please wait"/>
        </b-col>
      </b-row>
    </b-container>
   
  </div>
</template>

<script>

  import { find, repeat } from 'lodash'
  import { Awaitable, ms } from '~/plugins/helpers.js'

  export default {

    data() {

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
        parsing: new Awaitable(true)
      }

    },

    mounted() {
      this.syncLocal('studio', { select: ['tree'], inline: true })
    },

    computed: {

      node() { return this.tree.node }

    },

    methods: {


    },

    watch: {

      hashRoute: { immediate: true, async handler(slug) {

        ms('routing', true)
        await this.parsing.promise
        
        ms('parsed')

        let node = find( this.tree.nodes,
          slug.match(/^\d+$/)
            ? { id: parseInt(slug) }
            : (({ text }) => text?.includes(slug))
        )

        ms('node found')

        console.log({node})

        node?.nudge()

      }}

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