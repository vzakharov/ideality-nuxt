<template>
  <b-container fluid>
    <b-navbar class="d-sm-none">
      <b-navbar-nav class="ms-auto">
        <b-button v-b-modal.tools-modal variant="light">
          ⚙️
        </b-button>
        <b-modal id="tools-modal" title="Toolbox settings" no-fade hide-footer>
          <ToolboxSidebar 
            v-bind="{ widget, widgets, categories, expanded, ai, aiHidden }"
            v-on="{ assign }"
          />
        </b-modal>
      </b-navbar-nav>
    </b-navbar>
    <b-row style="height:100vh">
      <b-col class="bg-gray border p-2 d-none d-sm-block"
        sm="4" md="3" xl="2"
      >
        <ToolboxSidebar 
          v-bind="{ widget, widgets, categories, expanded, ai, aiHidden }"
          v-on="{ assign }"
        />
      </b-col>
      <b-col class="p-3">
        <WidgetBox v-if="widget">
          <WidgetProper :key="widget.id" v-bind="{ widget, ai }"/>
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
      let ai = {
        engine: 'curie',
        temperature: 0.5,
        apiKey: ''
      }
      let categories = [
        'Startup', 'Social', 'Brainstorming', 'Personal', 'Fun'
      ]
      return {
        ai,
        aiHidden: false,
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

    mounted() {
      this.ai = JSON.parse(localStorage.getItem('ai'))
    },

    // computed: {
    //   categories({ widgets } = this) {
    //     return chain(widgets).map('category').uniq().value()
    //   }
    // },

    watch: {
      ai: {
        handler(ai) {
          localStorage.setItem('ai', JSON.stringify(ai))
        },
        deep: true
      }
    }
    // methods: {


    // }

  }

</script>

<style>
.list-group-item {
  border: 0
}

</style>