import { assign, map, max, without, uniqueId } from 'lodash'
import { assignMethods, assignProperties } from '~/plugins/helpers.js'

function TreeNode({ vm, parent, tree }, values) {

  let node = this

  assign(node, values)

  !parent && ({ parent } = vm)
  !tree && ({ tree } = vm)

  assignProperties(node, {

    parent, tree,

    ancestors: () => parent ? [ ...parent.ancestors, parent ] : [],

    descendants: () => node.children?.map( child =>
      [ child, ...child.descendants || [] ]
    ).flat() || [],

    hasChildren: () => node.children?.length,

    hasSiblings: () => node.siblings?.length,

    heirs: () => node.hasChildren ? [ node.children[0], ...node.children[0].heirs || [] ] : [],

    isHeir: () => parent.children[0] == node,

    isRoot: () => !parent,

    siblings: () => without(parent?.children, node),

    root: () => node.isRoot ? node : parent.root,

    thread: () => [...node.ancestors, node, ...node.heirs]

  })

  assignMethods(node, {

    addChild() {

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

      vm.$set(node, 'children', [
        child,
        ...node.children || []
      ])

      return child

    },

    nudge(secondary) {

      let { parent } = node
      if ( parent ) {
        vm.$set(parent, 'children', [ node, ...node.siblings ])
        parent.nudge(true)
        if ( !secondary ) {
          vm.assignReactive(tree, { node })
          vm.log(node)
        }
      }

    },

    remove() {
      parent.children = vm.log(without(parent.children, node))
    },

    toggle() {
      node.collapsed = !node.collapsed
    }

  })

}

export {
  TreeNode
}