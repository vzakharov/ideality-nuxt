import { assign, find, map, mapValues, max, without, uniqueId } from 'lodash'
import { assignMethods, assignProperties, Internalize, objectify } from '~/plugins/helpers.js'

const computed = {

  ancestors() { 
    return this.parent ? [ ...this.parent.ancestors, this.parent ] : []
  },

  descendants() {
    return this.children?.map( child =>
      [ child, ...child.descendants || [] ]
    ).flat() || []
  },

  hasChildren() { return this.children?.length },

  hasSiblings() { return this.siblings?.length },

  heirs() { return this.hasChildren ? [ this.children[0], ...this.children[0].heirs || [] ] : [] },

  isHeir() { return this.parent.children[0] == this.node },

  isRoot() { return !this.parent },

  siblings() { return without(this.parent?.children, this.node) },

  root() { return this.isRoot ? this.node : this.tree.root },

  thread() { return [...this.ancestors, this.node, ...this.heirs] },

}

const methods = {

  addChild() {

    let { node } = this

    let child = new TreeNode({ 
      vm, parent: node, tree 
    }, {
      id: max([
        tree.max_id,
        max(map(tree.nodes, 'id'))
      ]) + 1,
      created: new Date()
    })

    vm.$set(tree, 'max_id', child.id)

    vm.assignReactive(node, {
      children: [ child, ...node.children || [] ],
      collapsed: undefined
    })

    return child

  },

  nudge(secondary) {

    let { parent, tree } = this

    if ( parent ) {
      parent.children = [ this, ...this.siblings ]
      parent.nudge(true)
      if ( !secondary ) {
        tree.current_node_id = this.id
      }
    }

  },

  remove() {

    let { node, parent, tree } = this

    parent.children = vm.log(without(parent.children, node))
    if ( node == tree.node )
      ( node.siblings?.[0] || parent ).nudge()
  },

  toggle() {
    this.collapsed = this.collapsed ? undefined : true
  }    

}

const NodeMixin = {

  mixins: [
    Internalize(
      'node', 
      'children collapsed created id text'.split(' '),
      { computed, methods }
    ),
  ]

}

export {
  NodeMixin
}