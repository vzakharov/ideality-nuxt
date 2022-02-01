import { filter, find, orderBy, without, uniqueId } from 'lodash'
import { dahnencode } from '~/plugins/helpers'

// In all the functions below, `this` refers to the Vue vm. It is assumed that it has a `this.tree` defined.

function addChild(node)  {

  let { tree } = this

  let child = {
    id: uniqueId(`${dahnencode(Date.now())}_`),
    nudged: new Date(),
    parent: node,
    collapsed: false
  }

  tree.nodes = [ ...tree.nodes, child ]

  this.reactify(child)

  return child

}

function getChildren(node) {
  return orderBy(
    filter(this.tree.nodes, { parent: node }),
    'nudged', 'desc'
  )
}

function remove(node) {
  this.tree.nodes = without(this.tree.nodes, node)
}

function hasChildren(node) {
  return this.getChildren(node).length
}

function hasSiblings(node) {
  return this.siblings(node).length
}

function isHeir(node) {
  return !this.hasSiblings(node) || !find(this.siblings(node), sibling => sibling.nudged > node.nudged)
}

function isRoot(node) {
  return node == this.tree.nodes[0]
}

function nudge(node) {
  this.$set(node, 'nudged', new Date())
  if ( node.parent )
    this.nudge(node.parent)
}

function orderNodes(node = this.tree.nodes[0], depth = 0) {
  return [
    { node, depth },
    ...node.collapsed ? [] : orderBy(
      this.getChildren(node),
      'nudged', 'desc'
    ).map(child => this.orderNodes(child, depth + 1))
  ].flat()
}

function siblings(node) {
  return without(this.getChildren(node.parent), node)
}


function toggle(node) {
  this.$set(node, 'collapsed', !node.collapsed)
}

export default { 
  addChild, 
  getChildren,
  hasChildren,
  hasSiblings,
  isHeir,
  isRoot,
  nudge,
  orderNodes,
  remove,
  siblings,
  toggle
}