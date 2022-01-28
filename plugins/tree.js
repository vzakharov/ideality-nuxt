import { filter, without } from 'lodash'

// In all the functions below, `this` refers to the Vue vm. It is assumed that it has a `this.tree` defined.

function addChild(node)  {

  let { tree } = this

  let child = {
    id: Date.now() + Math.random(),
    parent: node
  }

  tree.nodes = [ ...tree.nodes, child ]

  this.reactify(child)

  return child

}

function getChildren(node) {
  return filter(this.tree.nodes, { parent: node })
}

function destroy(node) {
  this.tree.nodes = without(this.tree.nodes, node)
}

function toggle(node) {
  this.$set(node, 'collapsed', !node.collapsed)
}

export default { 
  addChild, 
  getChildren,
  destroy,
  toggle
}