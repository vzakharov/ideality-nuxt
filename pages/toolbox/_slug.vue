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
            v-on="{ setFields }"
          />
        </b-modal>
      </b-navbar-nav>
    </b-navbar>
    <b-row style="height:100vh">
      <div class="bg-gray border p-2 d-none d-sm-block"
        style="width: 200px"
      >
        <ToolboxSidebar 
          v-bind="{ widget, widgets, categories, expanded, ai, aiHidden }"
          v-on="{ setFields }"
        />
      </div>
      <b-col>
        <b-row>
          <b-col class="p-3">
            <WidgetBox v-if="widget">
              <WidgetProper :key="widget.id" v-bind="{ widget, ai }" v-model="content[widget.id]"/>
            </WidgetBox>
          </b-col>
          <b-col v-if="widget.isNative && content[widget.id]" class="d-none d-md-block mt-3" :cols="previewExpanded ? 8 : 4">
            <h5>{{ widget.name }} preview</h5>
            <!-- <a href="#" class="small gray" v-text="previewExpanded ? 'smaller' : 'bigger'" @click.prevent="previewExpanded = !previewExpanded"/> -->
            <b-row class="border p-2 mt-3 me-2 shadow">
              <BuilderComponent :name="widget.display.native.componentName" :content="content[widget.id]" :size="previewExpanded ? 'sm' : 'xs'"/>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  import { chain, filter, find, without } from 'lodash'
  import Bubble from '~/plugins/bubble'

  export default {

    head() { return this.widgetHeader },

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
        content: {},
        expanded: [...categories],
        previewExpanded: true,
        filter,
        without
      }
    },

    async asyncData({ route: { params: { slug }}}) {
      let { widgets } = await
        Bubble.asyncData('widgets', { inToolbox: true }, { sortBy: ['sortIndex', 'name'] })(...arguments)
      let widget = slug ? find(widgets, {slug}) : widgets[0]
      return { widgets, widget }
    },

    mounted() {
      let ai = JSON.parse(localStorage.getItem('ai'))
      if ( ai ) Object.assign(this, {ai})
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