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
            <a href="#" style="color:#BBB"
              @click.prevent="expanded = expanded.length==categories.length ? [] : [...categories]"
            >
              <small v-text="expanded.length==categories.length ? 'Collapse all' : 'Expand all'"/>
            </a>
          </b-col>
        </b-row>
        <b-list-group>
          <b-list-group-item v-for="category in categories" :key="category" 
            href="#" class="p-0"
            :style="expanded.includes(category) && 'color:#BBB'"
          >
            <div
              @click="expanded = expanded.includes(category) ? without(expanded, category) : [...expanded, category]"
            >
              {{ expanded.includes(category) ? '▾' : '▸' }}
              {{ category }} tools
            </div>
            <b-list-group v-if="expanded.includes(category)"
              class="ps-2"
            >
              <b-list-group-item v-for="w in filter(widgets, {category})" :key="w.id"
                href="#"
                class="fw-bold"
                :active="w == widget"
                v-text="w.name"
                @click.prevent="widget = w"
              />
            </b-list-group>
          </b-list-group-item>
        </b-list-group>
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
      let categories = [
        'Startup', 'Social', 'Brainstorming', 'Personal', 'Fun'
      ]
      return {
        categories,
        expanded: [...categories],
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

    // computed: {
    //   categories({ widgets } = this) {
    //     return chain(widgets).map('category').uniq().value()
    //   }
    // },

    methods: {


    }

  }

</script>

<style>
.list-group-item {
  border: 0
}

</style>