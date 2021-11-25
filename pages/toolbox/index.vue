<template>
  <b-container fluid>
    <b-row style="height:100vh">
      <b-col class="bg-gray border p-2 d-none d-sm-block"
        sm="3" lg="2"
      >
        <b-row>
          <b-col cols="4">
            <h5>Tools</h5>
          </b-col>
          <b-col class="text-end">
            <a href="#" style="color:gray"
              @click.prevent="expanded = [...categories]"
            >
              <small>Expand all</small>
            </a>
          </b-col>
        </b-row>
        <b-row v-for="category in categories" :key="category" class="py-2">
          <div
            @click="expanded = expanded.includes(category) ? without(expanded, category) : [...expanded, category]"
            :style="'cursor:pointer'"
          >
            {{ expanded.includes(category) ? '▾' : '▸' }}
            {{ category }} tools
          </div>
          <div class="border" v-if="expanded.includes(category)">
            <b-row v-for="w in filter(widgets, {category})" :key="w.id">
              <b-button
                :variant="w == widget ? 'secondary' : 'light'" block
                v-text="w.name"
                @click.prevent="widget = w"
                class="text-start"
              />
            </b-row>
          </div>
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
          <WidgetProper :key="widget.id" v-bind="{widget}"/>
        </WidgetBox>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  import { chain, filter, without } from 'lodash'
  import Bubble from '~/plugins/bubble'

  export default {

    data() {
      return {
        expanded: [],
        filter,
        without
      }
    },

    async asyncData() {
      let { widgets } = await
        Bubble.asyncData('widgets', { inToolbox: true }, { sortBy: 'name' })(...arguments)
      let widget = widgets[0]
      return { widgets, widget }
    },

    computed: {
      categories({ widgets } = this) {
        return chain(widgets).map('category').uniq().value()
      }
    },

    methods: {


    }

  }

</script>

<style>

</style>