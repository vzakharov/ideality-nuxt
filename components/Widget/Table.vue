<template>
  <div>
    <b-table hover
      :fields="[
        'name',
        {
          key: 'runsLeft',
          label: 'Runs left'
        }
      ]"

      :items="widgets"
    >
      <template #cell(name)="data">
        <nuxt-link :to="{name: 'widget-id-config', params: {id: data.item.slug}}" v-text="data.item.name"/>
      </template>
    </b-table>
  </div>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  export default {

    data() {
      return {
        widgets: null
      }
    },

    async fetch() {

      Object.assign(this, await new Bubble(this).go('getUserWidgets'))
        
    }

  }

</script>

<style>

</style>