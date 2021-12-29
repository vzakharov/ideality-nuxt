<template>
  <div>
    {{node.bumped}}: {{node.body}}
    <ul v-if="node.hasChildren">
      <li v-for="child in node.heirs()" :key="child.slug">
        <StudioTree :node="child"/>
      </li>
    </ul>
  </div>
</template>

<script>
import { orderBy } from 'lodash'

export default {
  props: ['node'],

  methods: {
    orderBy
  }
}
</script>