<template>
  <div class="container-fluid p-0 bg-light vh-100 pt-5">
    <div class="container-sm w-auto p-3 shadow rounded mx-auto" style="max-width: 800px">
      <navbar @openDoc="openDoc"/>
      <div>
        <h1 v-if="!editingDocName" @click="editDocName()">{{ doc.name }}</h1>
        <input
          ref="docNameInput"
          type="text"
          v-model="doc.name"
          v-if="editingDocName"
          @blur="changeName()"
          @keyup.enter="changeName()"
        />
      </div>
      <div>
        <thread 
          v-if='centerNode'
          :start='nodes[0]'
          :topLevel=true
          :d='vm' 
          @node-action='nodeAction($event.node, $event.action, $event.options)'
        />
      </div>
      <!-- <hr>
      <tree :node='nodes[0]'/> -->
    </div>
  </div>
</template>

<script>
import navbar from '~/components/navbar.vue'
import Vue from 'vue'
import TextareaAutosize from 'vue-textarea-autosize'
import _ from 'lodash'
import { assign, filter, find, forEach, map, now, orderBy, pick, without } from 'lodash'
import Thread from '~/components/thread.vue'
import Login from '~/components/login.vue'
import Tree from '~/components/tree.vue'


// console.log(ideality)

Vue.use(TextareaAutosize)

export default {
  components: { navbar, Thread, Login, Tree },

  head() {
    return {
      title: this.doc.name + ' 🔺 Ideality',
      link: [
        {
          rel: 'canonical',
          href: 'https://ideality.app' + this.$route.path
        }
      ]
    }
  },

  data() {
    let { params } = this.$route
    let tree = JSON.parse(JSON.stringify(this.$store.state.tree))
    let data = {
      vm: this,
      centerNode: null,
      doc: {
        name:'Hello  world',
        id: params.docId,
      },
      node: null,
      nodes: [],
      editingDocName: false,
      route: null,
      tree,
      treeJson: '',
      _: this._
    }
    data.nodes =
    data.nodesLoaded = new Promise(resolve => data.resolveNodesLoaded = resolve)
    console.log('data prepared')
    return data
  },

  created() {
    // this.parseTree()
  },

  mounted() {
    window.vm = this
  },

  methods: {

    bump(node) {
      let bumped = now()
      for ( let n of [node, ...node.ancestors] )
        this.$set(n, 'bumped', bumped )
    },

    changeName() {
      this.editingDocName = false
    },

    editDocName() {
      this.editingDocName = true
      this.$nextTick(() => this.$refs.docNameInput.focus())
    },

    findNode(slug, nodes = this.nodes) {
      return find(this.nodes, { slug })
    },

    goto(node) {
      
      let destination = {
        name: 'd-docId-nodeSlug',
        params: {
          docId: this.doc.id,
          nodeSlug: node.slug
        },
        query: { edit: null }
      }
      this.$router.push(destination)

    },

    async nodeAction(node, action, options ) {
      let nodeToGoto = await doAction[action](node, options, { rebuild: this.parseTree })
      debugger
      this.goto(nodeToGoto)
    },

    openDoc(doc) {
      this.tree = JSON.parse(doc.tree)
      console.log(this.tree)
    },

    parseTree(tree = this.tree) {

      // if ( this.treeJson && JSON.stringify(tree) == this.treeJson )
      //   return this.nodes

      let slugs = []
      let index = 1
      let nodes = crawl(tree, (node, parent) => {

        for ( let key in node ) {
          this.$set(node, key, node[key])
        }
        this.$set(node, 'bumped', node.bumped || index++)
        this.set(node, {
          
          slug: slugify(node.body, { defaultText: 'node', slugs, mutateSlugs: true }),

          hasChildren: node.children && node.children.length > 0,

          branched: node.children && node.children.length > 1

        })

        console.log(node.slug)

        if ( parent )
          this.set(node, {

            parent,

            ancestors: [ ...parent.ancestors || [], parent ],

            siblings: without(parent.children, node),

          })

        return node
        
      })

      nodes.forEach(node => {

        if ( node.hasChildren ) {
          node.heirs = () => orderBy(node.children, ['bumped'], ['desc'])
        }

        node.tail = () => [node, ...node.hasChildren ? node.heirs()[0].tail() : []]

      })

      // this.treeJson = JSON.stringify(tree)

      this.resolveNodesLoaded()

      assign(this, {nodes})
      
      return nodes
    },

    set(object, ...valueses) {
      console.log(valueses)
      forEach(valueses, values =>
        forEach(values, (value, key) => {
          this.$set(object, key, value)
          let current = Object.getOwnPropertyDescriptor(object, key)
          if ( !current || !current.value ) {
            Object.defineProperty(object, key, {
              set: object.__lookupSetter__(key),
              get: object.__lookupGetter__(key),
              enumerable: false,
              configurable: true
            })
          }
        })
      )
    }

  },

  computed: {
    // node() {
    //   // debugger
    //   if ( this.centerNode ) {
    //     let { edit } = this.$route.query
    //     if ( typeof edit !== 'undefined' ) {
    //       let node = edit ? this.findNode(edit) : this.centerNode
    //       if (node) {
    //         this.bump(node)
    //         this.$nextTick(() => {
    //           try {
    //             window.document.getElementById('input').focus()
    //           } catch {}
    //         })
    //         // debugger
    //         return node
    //       }
    //     }
    //   }
    // },

    // centerNode() {
    //   if ( this.nodesLoaded ) {
    //     let node = this.findNode(this.$route.params.nodeSlug)
    //     if ( node ) {
    //       this.bump(node)
    //       return node
    //     }
    //   }
    // },

    thread() { 
      return this.nodes[0].tail()
    }

  },

  watch: {
    tree: {
      deep: true,
      handler() {
        this.$store.commit('set', {tree: JSON.parse(JSON.stringify(this.tree))})
      }
    },
    $route: {
      immediate: true,
      handler(route, oldRoute) {

        if ( oldRoute && route.fullPath == oldRoute.fullPath )
          return
        this.parseTree()
        this.centerNode = this.findNode(route.params.nodeSlug)
        if ( this.centerNode ) {
          this.bump(this.centerNode)
          let { edit } = route.query
          if ( typeof edit !== 'undefined' ) {
            let node = edit ? this.findNode(edit) : this.centerNode
            if (node) {
              this.bump(node)
              assign(this, {node})
              this.$nextTick(() => {
                try {
                  window.document.getElementById('input').focus()
                } catch {}
              })
            }
          }
        }

      }
    }
  }

}

function debug(what) {
  debugger
  return what
}

function getTail(node) {
  let result = [node]
  if (node.hasChildren)
    result.push(...getTail(node.children[0]))
  return result
}

function crawl(node, callback, { parent } = {} ) {
  return [
    callback(node, parent),
    ...map(node.children, child => crawl(child, callback, { parent: node }))
  ].flat()
}

function slugify(text, { keepTail, defaultText, slugs, mutateSlugs } = {} ) {
  // debugger
  let slug = (text || defaultText)

  if ( !keepTail )
    slug = slug
      .replace(/(?<=^.{20}.*?)\W.+/s, '')
  
  slug = slug
    .replace(/\W+/g, ' ')
    .trim()
    .replace(/ /g, '-')
    .toLowerCase()
    || defaultText

  // if (slug=='world-applications') debugger

  let numSlugsakes = filter(slugs, anotherSlug => 
    anotherSlug.match(new RegExp(
      `^${slug}(-\\d+)?$`)
    )
  ).length

  if ( numSlugsakes ) {
    // debugger
    slug += '-' + numSlugsakes
  }

  if ( mutateSlugs )
    slugs.push(slug)

  return slug
}

const doAction = {

  addChild: node => {
    let child = {}
    node.children.push(child)
    return child
  },

  split: (node, { at }, { rebuild }) => {
    let child = pick(node, 'children')
    node.children = [ child ]
    child.body = node.body.slice(at)
    node.body = node.body.slice(0, at)
    rebuild()
    return child
  }
}


</script>

<style>

</style>