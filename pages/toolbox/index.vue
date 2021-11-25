<template>
  <b-container fluid>
    <b-row style="height:100vh">
      <b-col class="bg-gray border p-2 d-none d-sm-block"
        sm="3" lg="2"
      >
        <h5>Tools</h5>
        <b-row v-for="w in widgets" :key="w.id">
          <b-button
            :variant="w == widget ? 'secondary' : 'light'" block
            v-text="w.name"
            @click.prevent="widget = w"
          />
        </b-row>
      </b-col>
      <b-col class="p-3">
        <b-dropdown class="d-sm-none" variant="outline-secondary" :text="widget ? widget.name : 'Choose a tool'">
          <b-dropdown-item v-for="w in widgets" :key="w.id"
            @click="widget = w"
          >
            {{ w.name }}
          </b-dropdown-item>
        </b-dropdown>
        <WidgetBox v-if="widget">
          <WidgetProper v-bind="{widget}"/>
        </WidgetBox>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  import Bubble from '~/plugins/bubble'

  export default {

    data() {
      return {
      }
    },

    async asyncData() {
      let { widgets } = await
        Bubble.asyncData('widgets', { inToolbox: true }, { sortBy: 'name' })(...arguments)
      let widget = widgets[0]
      return { widgets, widget }
    }

  }

</script>

<style>

</style>