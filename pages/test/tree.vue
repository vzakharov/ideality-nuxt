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
            <StudioThread v-bind="{
              node: tree.root,
              tree
            }"/>
            <!-- <transition-group name="node-span" tag="div">
              <Editable v-for="node in node.thread" :key="node.id"
                tag="div"
                :class="{
                  'd-inline': true,
                  'fw-bold': node == tree.node && tree.focused
                }"
                v-model="node.text"
                @focus.native="$router.push({ hash: '#'+node.id }); tree.focused = true"
                @blur.native="tree.focused = false"
                :id="'span-'+node.id"
                :ref="'span-'+node.id"
              />
            </transition-group> -->

            <!-- <template v-for="node in node.thread">
              <StudioSpan v-if="node != tree.node" :key="node.id" v-bind="{node}"/>
              <MyInput ref="input" id="input" v-else :key="node.id"
                v-model="node.text"
                multiline=true
              />
            </template> -->
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

        await this.$refs['span-'+node.id]?.mounting?.promise

        document.getElementById('span-'+node.id)?.focus()

      }}

    }


  }

</script>

<style>

</style>