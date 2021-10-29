<template>
  <b-dropdown size="sm" variant="outline-secondary" text="Create new">
    <b-dropdown-item disabled>
      {{ widgets ? 'Choose a template' : 'Loading templates' }}
      <b-spinner small v-if="!widgets"/>
    </b-dropdown-item>
    <b-dropdown-item v-for="widget in widgets" :key="widget.slug" @click="create(widget.id)">
      {{ widget.name }}
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

      Object.assign(this, await Bubble.anon.go('getTemplateWidgets'))

    },

    methods: {

      async create(template) {

        let bubble = new Bubble(this)
        let { widget } = await bubble.go('createWidget', { template })
        this.$router.push({name: 'widget-id-config', params: {id: widget.id}})

      }

    }

  }

</script>

<style>

</style>