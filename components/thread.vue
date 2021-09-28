<template>
<div v-if="start.tail" :class="{ small: !topLevel, 'text-secondary': !topLevel }">
  <span v-for='node in start.tail()' :key='node.slug'>
    <span
      v-if="node!=d.node && ( typeof node.body !== 'undefined' )"
      @click="$emit('node-click', node)" 
      v-html='node.body ? escape(node.body).replace(/\n/g, "<br/>") : "[empty]"'
    />
    <div v-if="node==d.node">
      <textarea-autosize 
        id='input' 
        rows="1" 
        style="min-height: 30px" 
        v-model='node.body' 
        class="form-control" 
      />
    </div>
    <a
      href='#'
      v-if="node.children && node.children.length > 1"
      style="color: lightgray; font-size:small; vertical-align: bottom;"
      @click="toggle(node)"
      >{{ node.expanded ? '⊟' : '⊞' }}</a>
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

let { log } = console

export default {

  
  props: ['thread', 'd', 'topLevel', 'start', 'bumped'],

  methods: {
    escape,
    log,
    toggle (node) { this.$set(node, 'expanded', !node.expanded) }
  }

}
</script>