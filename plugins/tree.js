import { assign, find, findIndex, last, map, mapValues, max, without, orderBy, uniqueId } from 'lodash'
import { assignMethods, assignProperties, Meta, objectify, Awaitable } from '~/plugins/helpers.js'

const computed = {

  ancestors() { 
    return this.parent?.isNotRoot ? [ ...this.parent.ancestors, this.parent ] : []
  },

  descendants() {
    return this.children?.map( child =>
      [ child, ...child.descendants || [] ]
    ).flat() || []
  },

  hasChildren() { return this.children?.length },

  hasSiblings() { return this.siblings?.length },

  heir() { return this.heirs[0] },

  heirs() { return this.hasChildren ? [ this.children[0], ...this.children[0].heirs || [] ] : [] },

  isHeir() { return this.parent.children[0] == this.node },

  isNotRoot() { return !!this.parent },

  isRoot() { return !this.parent },

  nextSibling() { return find(this.sortedSiblings, sibling => sibling.created < this.created ) || this.sortedSiblings[0] },

  parsed() { return !this.leftToParse },

  placeAmongSiblings() { return findIndex(this.parent.sortedChildren, this.node) + 1 },

  previousSibling() { return find(this.sortedSiblings, sibling => sibling.created > this.created ) || last(this.sortedSiblings) },

  siblings() { return without(this.parent?.children, this.node) },

  sortedChildren() { return orderBy(this.node.children, 'created', 'desc') },

  sortedSiblings() { return orderBy(this.siblings, 'created', 'desc') },

  root() { return this.isRoot ? this.node : this.tree.root },

  thread() { return [...this.ancestors, this.node, ...this.heirs] },

}

const methods = {

  async addChild() {

    let { tree } = this

    let child = {
      id: max([
        tree.max_id,
        max(map(tree.nodes, 'id'))
      ]) + 1,
      created: new Date()
    }

    const meta = new Awaitable()

    assignProperties(child, { 
      meta
    })

    tree.max_id = child.id

    assign(this, {
      children: [ child, ...this.children || [] ],
      collapsed: undefined
    })

    await meta.promise

    return child

  },

  focus() {
    let { id, tree } = this
    assign(tree, {
      current_node_id: id,
      focused: true
    })
    
  },

  nudge(secondary) {

    let { parent, tree } = this

    if ( parent ) {
      parent.children = [ this, ...this.siblings ]
      parent.collapsed = undefined
      parent.nudge(true)
      if ( !secondary ) {
        this.focus()
      }
    }

  },

  remove() {

    let { parent, siblings, tree: { node }, descendants } = this

    parent.children = without(parent.children, this)

    if ( this == node || descendants.includes(node) )
      ( siblings?.[0] || parent ).nudge()
  },

  toggle() {
    this.collapsed = !this.collapsed || undefined
  }    

}

const NodeMixin = {

  mixins: [
    Meta('node', { computed, methods, defaults: {
      children: undefined,
      collapsed: undefined,
      created: undefined,
      id: undefined,
      text: undefined
    } }),
  ]

}

export {
  NodeMixin
}