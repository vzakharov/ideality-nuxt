<template>
  <b-dropdown size="sm" variant="outline-secondary" text="Create new">
    <b-dropdown-item :to="{ name: 'widget-new' }">
      Empty widget
    </b-dropdown-item>
    <hr>
    <b-dropdown-item disabled>
      {{ widgets ? 'Choose a template' : 'Loading templates' }}
      <b-spinner small v-if="!widgets"/>
    </b-dropdown-item>
    <b-dropdown-item v-for="template in widgets" :key="template.id"
      :to="{ name: 'widget-new', query: { template: template.id }}"
    >
      {{ template.name }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>

  import Bubble from '~/plugins/bubble'

  export default {

    data() {
      return {
        widgets: null
      }
    },

    async fetch() {

      // Object.assign(this, await Bubble.anon.go('getTemplateWidgets'))
      let widgets = await Bubble.anon.get('widgets', { isExample: true }, { sortBy: 'name' })
      Object.assign(this, {widgets})

    }

  }

</script>

<style>

</style>