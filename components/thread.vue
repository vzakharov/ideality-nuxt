<template>
<div v-if="start.tail" :class="{ small: !topLevel }">
<span v-for='node in start.tail()' :key='node.slug'>
    <current-node 
      v-if="node==d.node" 
      :node='node'
      @action="$emit('node-action', $event)"
    />
    <a
      :class="{'link-secondary': !topLevel, 'link-dark': topLevel, 'text-decoration-none': true}"
      :href="d.getNodeRoute(node).href"
      @click.prevent="$emit('node-click', { node })"
      v-if="node!=d.node && ( typeof node.body !== 'undefined' )"
      v-html='node.body ? escape(node.body).replace(/\n/g, "<br/>") : "[empty]"'
    />
    <span
      href='#'
      v-if="node.children && node.children.length > 1"
      style="color: lightgray; font-size:small; vertical-align: bottom; cursor: pointer"
      @click="toggle(node)"
      v-text="node.expanded ? '⊟' : '⊞'"
    />
    <ul v-if="node.expanded && node.branched">
      <li v-for="child in node.heirs().slice(1)" :key='child.slug'>
        <thread 
          :start='child'
          :d='d'
          @node-click="$emit('node-click', $event)"
        />
      </li>
    </ul>
  </span>
</div>
</template>

<script>

import { escape } from 'lodash'
import CurrentNode from './currentNode.vue'

let { log } = console

export default {
  components: { CurrentNode },

  
  props: ['d', 'topLevel', 'start', 'bumped'],

  methods: {
    escape,
    log,
    toggle(node) { this.$set(node, 'expanded', !node.expanded) }
  }

}
</script>