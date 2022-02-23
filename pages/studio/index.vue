<template>
  <div v-if="canParse">
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
        sidebar: {
          items: [
            { tooltip: 'Navigation tree', icon: 'list-nested', to: '#tree', active: sidebar.section=='tree' },
            { tooltip: 'AI generation settings', icon: 'brain', to: '#ai', active: sidebar.section=='ai' },
          ]
        },
        content: {
          items: [
            { tooltip: 'Toggle edit mode', icon: 'pencil', onclick() { settings.editing = !settings.editing }, active: settings.editing },
            { tooltip: 'Toggle navigation', icon: 'list-nested', onclick() { settings.navigation = !settings.navigation }, active: settings.navigation },
            { tooltip: 'Create another variation of this part', if: !!settings.editing, icon: 'three-dots', onclick() { node.addSibling().then(setNode) } },
            { tooltip: 'Merge with previous part', if: !!settings.editing && !node.hasSiblings && !maybe(node.parent).isRoot, icon: 'intersect', onclick() { setNode(node.mergeUp()) } },
            { tooltip: 'Split this part', if: !!settings.editing, icon: 'scissors', onclick() { node.split(getCaretPosition('span-'+node.id)).then(setNode) }},
            { tooltip: 'Delete part', if: !!settings.editing, icon: 'trash', onclick() { setNode(node.remove()) }},
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
        <AISettings class="small p-2" v-if="$route.hash=='#ai'"/>
        <div v-else style="height: 100%" class="bg-light">
          <TreeNode v-bind="{ settings, tree, node: tree.root, grayOutNonCurrent: true }"/>
        </div>
      </template>
      <template #content>
        <div v-if="node" class="p-2">
          <div class="border p-2" id="editor" ref="editor">
            <StudioThread 
              v-if="settings.navigation" 
              v-bind="{
                node: tree.root,
                tree,
                settings
              }"
            />
            <MultiEditable v-else
              :key="node.threadId"
              :items="node.thread"
              :readonly="!settings.editing"
              :setId="node.id"
              @pick="setNode"
            />
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
  import { Awaitable, getCaretPosition, ms } from '~/plugins/helpers.js'

  export default {

    data() {

      return {
        canParse: false,
        items: [1,2,3,4,5,6,7,8,9],
        JSONCrush,
        copied: false,
        nextNum: 10,
        tree: {
          max_id: 0,
          root:
            { 
              id: 0,
              created: new Date(),
              children: [
                {
                  id: 1,
                  created: new Date()
                }
              ]
            }
        },
        parsing: new Awaitable(true),
        sidebar: {
          expanded: true,
          section: null
        },
        settings: {
          editing: true
        }
      }

    },

    async mounted() {
      let { code } = this.$route.query
      if ( this.queryFlags.sample ) {
        let [{ data }] = await this.$content('samples').where({slug:'studio'}).fetch()
        Object.assign(this, data)
        console.log(this)
      } else if ( code ) {
        this.tree = load(JSONCrush.uncrush(code))
      } else
        this.syncLocal('studio', { select: ['tree', 'settings'], append: ['settings'], inline: true ,
          beforeWrite: {
            tree: () => this.copied = false
          }
        })

      this.canParse = true
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

      getCaretPosition,

      setNode(nodeOrId) {
        let id = typeof nodeOrId == 'Object' ? nodeOrId.id : nodeOrId
        this.$router.push({ hash: '#'+id })
        // this.tree.setNode(node)
        // document.getElementById('span-'+node.id)?.focus?.()
      },

      dump

    },

    watch: {

      hashRoute: { immediate: true, async handler(slug) {

        await this.parsing.promise
        
        if (slug.match(/^\d+$/)) {

          let node = find( this.tree.nodes,
            slug.match(/^\d+$/)
              ? { id: parseInt(slug) }
              : (({ text }) => text?.includes(slug))
          )

          console.log({node})

          node?.nudge()

          await this.$refs['span-'+node.id]?.mounting?.promise

          // document.getElementById('span-'+node.id)?.focus()
          document.getElementById(node.id)?.scrollIntoView()

          if ( this.narrow ) this.sidebar.expanded = false
        } else if ( ['ai', 'tree'].includes(slug) ) {
          this.sidebar.section = slug
        }

      }}

    }


  }

</script>

<style>

</style>