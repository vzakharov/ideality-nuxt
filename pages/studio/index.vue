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
            { icon: 'list-nested', onclick() { settings.navigation = !settings.navigation }, active: settings.navigation },
            { icon: 'pencil', onclick() { tree.editing = !tree.editing }, active: tree.editing },
            { icon: 'three-dots', onclick() { node.addSibling().then(setNode) } },
            { if: !node.hasSiblings && !maybe(node.parent).isRoot, icon: 'intersect', onclick() { setNode(node.mergeUp()) } },
            { icon: 'scissors', onclick() { node.split(getCaretPosition('span-'+node.id)).then(setNode) }},
            { icon: 'trash', onclick() { setNode(node.remove()) }},
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
        <div style="overflow-x: auto; height: 100%" class="bg-light">
          <TreeNode v-bind="{ tree, node: tree.root }"/>
        </div>
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

      getCaretPosition(id) {
        let editableDiv = document.getElementById(id)
        let caretPos = 0,
          sel, range
        if (window.getSelection) {
          sel = window.getSelection()
          if (sel.rangeCount) {
            range = sel.getRangeAt(0)
            if (range.commonAncestorContainer.parentNode == editableDiv) {
              caretPos = range.endOffset
            }
          }
        } else if (document.selection && document.selection.createRange) {
          range = document.selection.createRange()
          if (range.parentElement() == editableDiv) {
            let tempEl = document.createElement("span")
            editableDiv.insertBefore(tempEl, editableDiv.firstChild)
            let tempRange = range.duplicate()
            tempRange.moveToElementText(tempEl)
            tempRange.setEndPoint("EndToEnd", range)
            caretPos = tempRange.text.length
          }
        }
        return caretPos
      },

      setNode(node) {
        this.tree.setNode(node)
        document.getElementById('span-'+node.id)?.focus?.()
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