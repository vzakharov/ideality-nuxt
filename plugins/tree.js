import { assign, find, map, mapValues, max, without, uniqueId } from 'lodash'
import { assignMethods, assignProperties, objectify } from '~/plugins/helpers.js'

const computed = {

  ancestors() { 
    return this.parent.isTreeNode ? [ ...this.parent.ancestors, this.parent ] : []
  },

  children () {
    return this.node.children?.map(({ id }) => find(this.$children, { id }))
  },

  descendants() {
    return this.children?.map( child =>
      [ child, ...child.descendants || [] ]
    ).flat() || []
  },

  hasChildren() { return this.children?.length },

  hasSiblings() { return this.siblings?.length },

  heirs() { return this.hasChildren ? [ this.children[0], ...this.children[0].heirs || [] ] : [] },

  isHeir() { return this.parent.children[0] == this },

  isRoot() { return !this.parent },

  parent() {
    return this.$parent
  },

  siblings() { return without(this.parent?.children, this) },

  // root() { return this.isRoot ? this : this.parent.root },

  thread() { return [...this.ancestors, this, ...this.heirs] },

}

let NodeMixin = {

  created() {

    // let { parent, tree } = this

    // assignProperties(this.node, {
    //   ...mapValues( computeds, 
    //     ( value, key ) => () => this[key],
    //   ), tree, parent
    // })

  },

  computed,

  methods: {

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

      let { node, parent, tree } = this

      if ( parent ) {
        parent.node.children = [ node, ...map(this.siblings, node => node.node) ]
        // parent.nudge(true)
        // if ( !secondary ) {
        //   vm.assignReactive(tree, { node })
        //   vm.log(node)
        // }
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

}

export {
  NodeMixin
}