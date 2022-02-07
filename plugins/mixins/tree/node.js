import { filter, find, orderBy, without, uniqueId } from 'lodash'
import { encode } from 'dahnencode'

// In all the functions below, `this` refers to the Vue vm. It is assumed that it has a `this.tree` defined.

function addChild()  {

  let { node, tree } = this

  let child = {
    id: encode( ( Date.now() - new Date(this.tree.nodes[0].created) + uniqueId() ) / 100 ),
    nudged: new Date(),
    parent: node,
    collapsed: false
  }

  tree.nodes = [ ...tree.nodes, child ]

  this.reactify(child)

  return child

}

function children({ node } = this) {
  let { tree } = this
  return orderBy(
    filter(tree.nodes, { parent: node }),
    'nudged', 'desc'
  )
}

function remove() {
  let { node, tree } = this
  tree.nodes = without(tree.nodes, node)
}

function hasChildren() {
  return this.children.length
}

function hasSiblings() {
  return this.siblings.length
}

function isHeir() {
  return !this.hasSiblings || !find(this.siblings, sibling => sibling.nudged > node.nudged)
}

function isRoot() {
  let { tree: { nodes }, node } = this
  return node == nodes[0]
}

function nudge({ node } = this) {
  this.$set(node, 'nudged', new Date())
  if ( node.parent )
    nudge.call(this, { node: node.parent })
}

function siblings({ node } = this) {
  return without(children.call(this, { node: node.parent }), node)
}


function toggle({ node } = this) {
  this.$set(node, 'collapsed', !node.collapsed)
}

export default { 

  computed: {
    hasChildren,
    children,
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