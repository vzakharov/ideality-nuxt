<template>
  <div>
    <div v-for="(item, i) in value" :key="i">
      <h6 v-text="`${upperFirst(title)} #${i+1}`"/>
      <component :is="component" 
        v-bind="{
          i,
          value: item,
          context
        }"
        @input="$emit('input', {...value})"
      />
    </div>
    <b-button v-text="`Add ${title}`" variant="outline-secondary" size="sm" :class="'mx-2'" 
      @click="add"
    />
  </div>
</template>

<script>

  import { upperFirst } from 'lodash'

  export default {

    props: ['value', 'component', 'title', 'defaultItem', 'context'],

    methods: {
      add() {
        debugger

        this.$emit('input', [
          ...(
            this.value || []
          ),
          this.defaultItem
        ])
      },

      upperFirst
    }

  }

</script>

<style>

</style>