<template>
  <button class="btn btn-light" @click="parent[itemsKey] = items.filter(i => i != item); $emit('deleted')" v-text="'Delete'"/>
</template>

<script>

import { keys } from 'lodash'

export default {
  props: ['parent', 'items', 'item'],
  computed: {
    itemsKey() {
      return Object.getOwnPropertyNames(this.parent).find(key => this.parent[key] == this.items)
    }
  }
}
</script>