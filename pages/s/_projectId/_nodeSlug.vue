<template>
  <div class="container-fluid p-0 bg-light vh-100 pt-5">
    <div class="container-sm w-auto p-3 shadow rounded mx-auto" style="max-width: 800px">
      <navbar @openProject="openProject"/>
      <div>
        <h1 v-if="!editingDocName" @click="editDocName()">{{ project.name }}</h1>
        <input
          ref="docNameInput"
          type="text"
          v-model="project.name"
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
          @node-action='doNodeAction($event.node, $event.action, $event.options)'
          @node-click='goto($event.node)'
          @input-blur='goto(node)'
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
      title: this.project.name + ' 🔺 Ideality',
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
      project: {
        name:'Hello  world',
        id: params.projectId,
      },
      node: null,
      nodes: [],
      editingDocName: false,
      route: null,
      tree,
      treeJson: '',
      _: this._
    }
    // data.nodes =
    data.nodesLoaded = new Promise(resolve => data.resolveNodesLoaded = resolve)
    // console.log('data prepared')
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
      if ( !slug ) 
        return nodes[0]
      let node = find(nodes, { slug })
      if ( !node )
        node = find(nodes, node => node.body && this.slugify(node.body, {keepTail: true}).includes(slug))
      return node
    },

    getNodeRoute(node) {

      let { centerNode } = this
      // let switchCenterNode = centerNode != node && !centerNode.ancestors.includes(node) && !node.ancestors.includes(this.centerNode)
      let location = {
        name: 'p-projectId-nodeSlug',
        params: {
          projectId: this.project.id,
          nodeSlug: node.slug
        },
        query: { edit: null }
      }
      return {...this.$router.resolve(location), location }
    },

    goto(node) {

      let nodeRoute = this.getNodeRoute(node)

      history.replaceState(null, null, nodeRoute.href)
      if ( node != this.node ) {
        assign(this, { node, centerNode: node })
        this.bump(node)
      }

    },

    async doNodeAction(node, action, options ) {
      action = nodeAction[action]
      let nodeToGoto = await action.run(node, options, { rebuild: this.parseTree })
      if ( action.rebuild )
        this.parseTree()
      this.goto(nodeToGoto)
    },

    openProject(project) {
      this.tree = JSON.parse(project.tree)
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
          
          slug: this.slugify(node.body, { defaultText: 'node', mutateSlugs: true, slugs }),

          hasChildren: node.children && node.children.length > 0,

          branched: node.children && node.children.length > 1

        })

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

      nodes = orderBy(nodes, 'bumped', 'desc')
      // this.treeJson = JSON.stringify(tree)

      this.resolveNodesLoaded()

      assign(this, {nodes})
      
      return nodes
    },

    set(object, ...valueses) {
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
    },

    slugify(text, { keepTail, defaultText, mutateSlugs, slugs, excludeNodes } = {} ) {
      // debugger
      if ( !slugs ) 
        slugs = map(without(this.nodes, ...excludeNodes || []), 'slug')
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

      if ( slugs ) {
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
      }

      return slug
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
    'node.body': function(body) {
      let { node } = this
      if ( !node ) return
      node.slug = this.slugify(body, { defaultText: 'node', excludeNodes: [node] })
      // this.goto(node)
    },

    // tree: {
    //   deep: true,
    //   handler() {
    //     this.$store.commit('set', {tree: JSON.parse(JSON.stringify(this.tree))})
    //     this.parseTree()
    //   }
    // },

    $route: {
      immediate: true,
      handler(route, oldRoute) {

        if ( oldRoute && route.fullPath == oldRoute.fullPath )
          return
        this.parseTree()

        let { projectId, nodeSlug } = route.params

        this.centerNode = this.findNode(nodeSlug)

        if ( this.centerNode ) {
          this.bump(this.centerNode)
          let { edit } = route.query
          if ( typeof edit !== 'undefined' ) {
            let node = edit ? this.findNode(edit) : this.centerNode
            if ( node ) {
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


const nodeAction = {

  split: {
    run: (node, { at }) => {
      let child = pick(node, 'children')
      node.children = [ child ]
      child.body = node.body.slice(at)
      node.body = node.body.slice(0, at)
      return child
    },
    rebuild: true
  },

  addSibling: {
    run: node => {
      node.siblings.push({})
    }
  }
}


</script>