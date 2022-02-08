import { filter, find, orderBy, without, uniqueId } from 'lodash'
import { encode } from 'dahnencode'

// In all the functions below, `this` refers to the Vue vm. It is assumed that it has a `this.tree` defined.

function addChild()  {

  let { node } = this

  let child = {
    id: encode( ( Date.now() - new Date(this.tree.root.created) + uniqueId() ) / 100 ),
    created: new Date()
    // nudged: new Date(),
    // collapsed: false
  }

  this.$set(node, 'children', [
    ...node.children || [],
    child
  ])

  // this.reactify(child)

  return child

}

function remove() {
  let { node, node: { parent }} = this
  parent.children = without(parent.children, node)
}

function hasChildren() {
  return this.node.children?.length
}

function hasSiblings() {
  return this.siblings?.length
}

function isHeir() {
  return !this.hasSiblings || !find(this.siblings, sibling => sibling.nudged > node.nudged)
}

function isRoot() {
  let { tree: { root }, node } = this
  return node == root
}

function nudge({ node } = this) {
  node.nudge()
  // this.$set(node, 'nudged', new Date())
  // if ( node.parent )
  //   nudge.call(this, { node: node.parent })
}

function siblings({ node } = this) {
  return without(node.parent.children, node)
}


function toggle({ node } = this) {
  this.$set(node, 'collapsed', !node.collapsed)
}

export default { 

  computed: {
    hasChildren,
    hasSiblings,
    isHeir,
    isRoot,
    siblings
  },

  methods: {
    addChild, 
    nudge,
    remove,
    toggle  
  }
  
}