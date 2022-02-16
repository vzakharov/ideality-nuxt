<template>
  <div v-if="mounted">
    <TreeMeta v-bind="{tree}" @parsed="parsing.resolve()"/>
    <MyLayout v-if="parsing.resolved" v-bind="{
      sidebar,
      nav: {
        section: 'Tools',
        target: { name: 'studio' }
      },
      about: {
        title: 'Studio',
        tagline: 'Tree-based brainstorming editor'
      },
      toolbars: {
        content: {
          items: [
            { icon: 'pencil', onclick() { tree.editing = !tree.editing }, active: tree.editing },
            { icon: 'list-nested', onclick() { settings.navigation = !settings.navigation }, active: settings.navigation },
            { 
              text: link.copied ? 'link copied!' : '', 
              icon: link.copied ? 'check' : link.copying ? 'three-dots' : 'link-45deg', 
              onclick() { link.copy() } 
            },
          ]
        }
      }
    }">
      <template #sidebar>
        <TreeNode v-bind="{ tree, node: tree.root }"/>
      </template>
      <template #content>
        <div v-if="node" class="p-2">
          <div class="border p-2" id="editor" ref="editor">
            <StudioThread v-bind="{
              node: tree.root,
              tree,
              settings
            }"/>
          </div>
        </div>
        <Loading v-else message="Processing, please wait"/>
      </template>
    </MyLayout>
    <Meta>
      <Copiable ref="link" :fetch="getLink"/>
    </Meta>
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
        copied: false,
        nextNum: 10,
        tree: {
          max_id: 0,
          root:
            { 
              id: 0,
              created: new Date()
            }
        },
        parsing: new Awaitable(true),
        sidebar: {
          expanded: true
        },
        settings: {
          navigation: true
        }
      }

    },

    mounted() {
      let { code } = this.$route.query
      if ( code ) {
        this.tree = load(JSONCrush.uncrush(code))
      } else
        this.syncLocal('studio', { select: ['tree', 'settings'], inline: true ,
          beforeWrite: {
            tree: () => this.copied = false
          }
        })
    },

    computed: {

      node() { return this.tree.node },
      link() { return this.$refs.link }

    },

    methods: {

      async getLink() {
        let { $axios, tree, $router } = this
        return $axios.defaults.baseURL+$router.resolve({ query: { code: JSONCrush.crush(dump(tree)) }}).href.slice(1) 
      },

      dump

    },

    watch: {

      hashRoute: { immediate: true, async handler(slug) {

        ms('routing', true)
        await this.parsing.promise
        
        ms('parsed')

        if (slug.match(/^\d+$/)) {

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

          if ( this.narrow ) this.sidebar.expanded = false
        }

      }}

    }


  }

</script>

<style>

</style>