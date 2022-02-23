import { assign, find, findIndex, last, map, mapValues, max, without, orderBy, uniqueId } from 'lodash'
import { assignMethods, assignProperties, Meta, objectify, Awaitable, toggle } from '~/plugins/helpers.js'

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

  isCurrent() { return this.tree.node == this.node },

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

  threadId() { return map(this.thread, 'id').join('-') }

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

  async addSibling() {
    return await this.parent.addChild()
  },

  focus() {
    let { id, tree } = this
    assign(tree, {
      current_node_id: id
    })
    
  },

  mergeUp() {

    let { parent, children, text } = this

    parent.children = children
    parent.text += text

    return parent
    
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
    
    return this

  },

  remove() {

    let { parent, siblings, tree: { node }, descendants } = this

    parent.children = without(parent.children, this)

    let newNodeToFocus = ( siblings?.[0] || parent )
    if ( this == node || descendants.includes(node) )
      newNodeToFocus.nudge()

    return newNodeToFocus
    
  },

  async split(position) {
    let { text, children: [...children] = [] } = this
    
    let child = await this.addChild()
    assign(child, { children })
    this.children = [child]
    child.text = text.slice(position)
    this.text = text.slice(0, position)
    return child
  },

  toggle

}

const NodeMixin = {

  mixins: [
    Meta('node', { computed, methods, defaults: {
      children: undefined,
      collapsed: undefined,
      created: undefined,
      pinBranches: undefined,
      id: undefined,
      text: undefined
    } }),
  ]

}

export {
  NodeMixin
}