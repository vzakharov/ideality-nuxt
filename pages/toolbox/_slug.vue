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
        style="font-size: smaller; width: 250px; height: 100vh; overflow:hidden; overflow-y:auto"
      >
        <ToolboxSidebar 
          v-bind="{ widget, widgets, categories, expanded, ai, aiHidden }"
          v-on="{ setFields }"
        />
      </div>
      <b-col>
        <b-row>
          <b-col class="p-3">
            <Widget v-if="widget" box :key="widget.id" v-bind="{ widget, ai }" v-model="content[widget.id]"/>
          </b-col>
          <b-col v-if="widget.isNative && content[widget.id]" class="d-none d-md-block mt-3" 
            :cols="6"
            :lg="previewExpanded ? 7 : 4"
          >
            <h5>{{ widget.name }} preview</h5>
            <!-- <a href="#" class="small gray" v-text="previewExpanded ? 'smaller' : 'bigger'" @click.prevent="previewExpanded = !previewExpanded"/> -->
            <b-row
                class="border p-2 mt-3 me-2 shadow"
            >
              <Block
                class="scaled"
                :type="widget.display.native.componentName" :content="content[widget.id].output"
              />
            </b-row>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  import { filter, find, without } from 'lodash'
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
        'Startup', 'Social', 'Brainstorming', 'Personal', 'Creative', 'Fun'
      ]
      return {
        ai,
        aiHidden: true,
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

    watch: {
      ai: {
        handler(ai) {
          localStorage.setItem('ai', JSON.stringify(ai))
        },
        deep: true
      }
    }

  }

</script>

<style>

  .list-group-item {
    border: 0
  }

  @media (min-width: 992px) {
    
    .scaled {
      /* transform: scale(90%) */
      zoom: 65%
    }

  }

</style>