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
          v-if='nodes'
          :start='nodes[0]'
          :topLevel=true
          :d='vm' 
          @node-action='goto($event.node[$event.action]())'
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
import { assign, filter, find, forEach, map, now, orderBy, without } from 'lodash'
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
    let { docId, nodeSlug } = params
    let tree = {
      children: [{ 
        body: 'Hello world', children: [{
          body: '! My name is', children: [{
            body:' Vova', children: [{
              body: '. Bye-bye!'
            }]}, {
              body: ' Jack.'
            }
          ]
        }, {
          body: '. How are you?',
          children: [{
            body: " I'm okay"
          }]
        }, {
          body: '? Hmm...'
        }, {
          body: 'Test'
        }]
      }]
    }
    let data = {
      vm: this,
      doc: {
        name:'Hello  world',
        id: params.docId,
      },
      nodeSlug,
      editingDocName: false,
      nodesLoaded: null,
      tree,
      treeJson: '',
      _: this._
    }
    console.log('data prepared')
    return data
  },

  created() {
    this.nodes = this.parseTree(this.tree)

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

    findNode(slug) {
      return find(this.nodes, { slug })
    },

    goto(node) {

      // this.$router.push()

    },

    openDoc(doc) {
      this.tree = JSON.parse(doc.tree)
      console.log(this.tree)
    },

    parseTree(tree) {

      // if ( this.treeJson && JSON.stringify(tree) == this.treeJson )
      //   return this.nodes

      let slugs = []
      let index = 1
      let nodes = crawl(tree, (node, parent) => {
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
        
        node.split = () => console.log("Split requested")

        return node
      })

      nodes.forEach(node => {
        if (node.hasChildren) {
          node.heirs = () => orderBy(node.children, ['bumped'], ['desc'])
        }

        node.tail = () => [node, ...node.hasChildren ? node.heirs()[0].tail() : []]

      })

      // this.treeJson = JSON.stringify(tree)

      if ( !this.nodesLoaded )
        this.nodesLoaded = true

      return nodes
    },

    set(object, ...valueses) {
      console.log(valueses)
      forEach(valueses, values =>
        forEach(values, (value, key) => {
          // console.log(key, value)
          console.log('\n\nSetting')
          console.log(key)
          console.log('for')
          console.log(object)
          console.log('to')
          console.log(value)
          let current = Object.getOwnPropertyDescriptor(object, key)
          console.log('(current):')
          console.log(current)
          this.$set(object, key, value)
          if ( !current || !current.value ) {
            console.log(object.__lookupSetter__(key))
            console.log(object.__lookupGetter__(key))
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
    node() {
      // debugger
      if ( this.centerNode ) {
        let { edit } = this.$route.query
        if ( typeof edit !== 'undefined' ) {
          let node = edit ? this.findNode(edit) : this.centerNode
          if (node) {
            // debugger
            return node
          }
        }
      }
    },

    // nodes() {
    //   debugger
    //   return this.parseTree(this.tree)
    // },

    centerNode() {
      if ( this.nodesLoaded ) {
        let node = this.findNode(this.$route.params.nodeSlug)
        this.bump(node)
        return node
      }
    },

    thread() { 
      return this.nodes[0].tail()
    }
    // the() {
    //   return {
    //     thread: getThread(this.tree),
    //     node: this.theNode
    //   }
    // }
  },

  watch: {

    node(node) {
      this.bump(node)
      this.$nextTick(() => {
        try {
          window.document.getElementById('input').focus()
        } catch {}
      })

    },

    // tree: {
    //   deep: true, immediate: true,
    //   handler: function(tree) { 
    //     if ( this.treeJson != JSON.stringify(tree) )
    //     {
    //       this.treeJson = JSON.stringify(tree)
    //       debugger
    //     }
    //   }
    // }

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

</script>

<style>

</style>