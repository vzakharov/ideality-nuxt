<template>
  <span>
    <b>{{ _key }}</b>
    <template v-if="isObject">
      <a href="#" v-text="expanded ? '⊟' : '⊞'" @click.prevent="expanded=!expanded"/>
      <ul v-if="expanded">
        <li v-for="_key in keys(object)" :key="_key">
          <Inspect :value="object[_key]" v-bind="{_key, expandAll}"/>
        </li>
      </ul>
    </template>
    <span v-else v-text="': ' + ( isDate ? object : JSON.stringify(object) )"/>
  </span>
</template>

<script>

  import { keys } from 'lodash'

  export default {
    props: ['_key', 'value', 'expand', 'expandAll'],

    data() { return {

      object: this.value,
      expanded: this.expand || this.expandAll

    }},

    computed: {
      isDate() { return this.object instanceof Date },
      isObject() { return !this.isDate && typeof this.object === 'object' },
      isPrimitive() { return !this.isObject && !this.isDate }
    },

    methods: {
      keys
    }

  }

</script>

