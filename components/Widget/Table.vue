<template>
  <div>
    <div v-if="!widgets">
      <em>
        Loading your widgets, please wait...
      </em>
      <b-spinner small/>
    </div>
    <b-table hover v-else
      :fields="(sortable = true, [
        { 
          key: 'name',
          sortable
        }, {
          key: 'modifiedDate',
          label: 'Modified',
          formatter: value => {
            let daysAgo = 
            Math.round(( new Date() - new Date(value) )/1000/3600/24)
            return daysAgo ? `${daysAgo} days ago` : 'today'
          },
          sortable
        },
        {
          key: 'runsLeft',
          label: 'Runs left',
          sortable
        }
      ])"

      :items="orderBy(widgets, 'modifiedDate', 'desc')"
    >
      <template #cell(name)="data">
        <nuxt-link :to="{name: 'widget-id-config', params: {id: data.item.slug || data.item.id}}" v-text="data.item.name || '[Untitled]'"/>
      </template>
    </b-table>
  </div>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  import { orderBy } from 'lodash'

  export default {

    data() {
      return {
        widgets: null
      }
    },

    async fetch() {

      this.widgets = await new Bubble(this).get('widgets', { owner: this.$auth.user.id })
        
    },

    methods: {
      orderBy
    }


  }

</script>

<style>

</style>