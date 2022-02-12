<template>
  <div v-if="mounted">
    <TreeMeta v-bind="{tree}" @parsed="parsing.resolve()"/>

    <b-container fluid v-if="parsing.resolved">
      <b-row>
        <b-col cols="12" sm="5" md="3" class="bg-light vh" >
          <TreeNode v-bind="{ tree, node: tree.root }"/>
        </b-col>
        <b-col>
          <MyInput v-model="tree.focused" caption="Edit"/>
          <!-- <style>
            :root {
              --editor-offset-right: {{ store.editorOffsetRight }}
            }
          </style> -->
          <div v-if="node" class="border p-2" id="editor" ref="editor">
            <StudioThread v-bind="{
              node: tree.root,
              tree
            }"/>
          </div>
          <Loading v-else message="Processing, please wait"/>
          <b-button class="mt-2" variant="outline-secondary"
            :to="{ query: { code: JSONCrush.crush(dump(tree)) }}"
            target="_blank"
          >
            Share as link
          </b-button>
        </b-col>
      </b-row>
    </b-container>
   
  </div>
</template>

<script>

  import JSONCrush from '~/plugins/jsoncrush'
  import { load, dump } from 'js-yaml'
  import { find, repeat } from 'lodash'
  import { Awaitable, ms } from '~/plugins/helpers.js'

  export default {

    data() {

      return {
        items: [1,2,3,4,5,6,7,8,9],
        JSONCrush,
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
      let { code } = this.$route.query
      if ( code ) {
        this.tree = load(JSONCrush.uncrush(code))
      } else
        this.syncLocal('studio', { select: ['tree'], inline: true })
    },

    computed: {

      node() { return this.tree.node }

    },

    methods: {

      dump

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

        await this.$refs['span-'+node.id]?.mounting?.promise

        document.getElementById('span-'+node.id)?.focus()

      }}

    }


  }

</script>

<style>

</style>