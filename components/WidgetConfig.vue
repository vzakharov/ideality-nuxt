<template>
  <b-row>
    <b-navbar>
      <b-navbar-nav>
        <b-nav-form>
          <h2 class="ideality-widget-heading">
            <span v-if="widget.name" v-text="widget.name"/>
            <em v-else>Unnamed widget</em>
          </h2>
          <small class="text-muted">
            Embed:
            <nuxt-link class="text-secondary" :to="embedRoute" v-text="'https://ideality.app'+$router.resolve(embedRoute).href"/>
          </small>
        </b-nav-form>
      </b-navbar-nav>
      <b-navbar-nav class="ms-auto">
        <b-nav-form v-if="saved || changed">
          <b-button 
            :variant="saveDisabled ? 'light' : 'primary'" 
            :disabled="saveDisabled" 
            v-text="saving ? 'Saving...' : saved && !changed ? 'Saved!' : 'Save' " 
            @click="save"
          />
        </b-nav-form>
        <b-nav-item-dropdown text="More" variant="outline-secondary">
          <b-dropdown-item :to="{ name: 'dashboard-widget-new', query: { template: widget.id }}">
            Clone
          </b-dropdown-item>
          <b-dropdown-item @click="unlink" variant="danger">
            Delete
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-navbar>
    <b-row>      
      <div>
        <ul class="nav nav-tabs">
          <li class="nav-item" 
            v-for="item in [...[
              { slug: 'display', caption: 'Display settings'},
              { slug: 'setup', caption: 'AI settings' },
              { slug: 'template', caption: 'Template settings'}
            ].filter(item=>vm[item.slug]),
              { slug: 'yaml', caption: 'Edit as YAML' },
              { slug: 'test', caption: 'Try it out'}
            ]"
            :key="item.slug"
          >
            <b-link
              :class="{
                'nav-link': true,
                active: section == item.slug
              }"
              v-text="item.caption"
              :to="appendRoute({query: { section: item.slug }})"
              @click="section=item.slug"
            />
          </li>
        </ul>

        <template v-if="section=='display'">
          <LabeledInput v-model="widget.name" caption="Name" placeholder="Name for your own reference, not displayed for the user"/>
          <WidgetDisplayConfig :context="{widget}" v-model="display"/>
        </template>
        <WidgetSetup v-if="section=='setup'" v-model="setup" v-bind="{widget}"/>
        <TemplateConfig v-if="section=='template'" v-model="widget.template" v-bind="{widget}"/>
        <WidgetProper v-if="section=='test'" v-bind="{widget}"/>

        <div v-if="section=='yaml'">
          <textarea-autosize
            style="font-family: monospace!important; font-size: smaller;"
            class="text-monospace w-100"
            rows="25"
            v-model.lazy="widgetYaml"
          />
        </div>
      </div>

      <!-- YAML editor -->

    </b-row>
  </b-row>
</template>

<script>

// import ObjectConfig from '@/components/ObjectConfig.vue'

import { assign, findIndex, get, last, mapValues, omit, pick, without } from 'lodash'
import yaml from 'js-yaml'
import Bubble from '~/plugins/bubble'

export default {

  props: ['id', 'value'],

  data() { 

    assign(this, { without, yaml })

    return {
      changed: false,
      widget: this.value,
      saving: false,
      saved: false,
      editYaml: false,
      deleteRequested: false,
      example: get(this, 'widget.setup.examples[0]'),
      oldConfig: null,
      section: this.$route.query['section'] || 'display'
    }
  },

  watch: {

    changed() {
      // window.onbeforeunload = this.changed ? () => { return "" } : undefined
    },

    widget: {
      deep: true,
      handler(widget, old) {
        if ( old == this.oldConfig )
          return
        this.changed = true
        this.oldConfig = this.widget
        this.widget = {...widget}
        // this.$emit('input', this.widget)
      }

    }
  },

  computed: {

    embedRoute() {
      return { name: 'widget-id', params: { id: this.widget.slug }}
    },

    widgetYaml: {
      get() { return yaml.dump(omit(this.widget, 'tie')) },

      set(value) { assign(this.widget, yaml.load(value)) }
    },

    exampleIndex() { return findIndex(this.examples, this.example) },

    saveDisabled() { return !this.changed || this.saving },

    apiUrl() { return 'https://b.ideality.app/api/1.1/obj/widget/' + this.widget.id },

    setup() { return this.widget.setup },
    display() { return this.widget.display },
    template() { return this.widget.template },

    examples: {
      get() { return this.setup.examples || [] },
      set(value) { this.setup.examples = value }
    },

    parameters: {
      get() { return this.template.parameters || []},
      set(value) { this.template.parameters = value }
    }


  },

  
  methods: {

    async clone() {
      let { id } = this.widget
      let { response: { newWidget }} = await this.$axios.$post('https://b.ideality.app/api/1.1/wf/cloneWidget', { id })
      console.log(newWidget)
      this.$router.push({...this.$route, name: 'dashboard-widget-id', params: { id: newWidget._id }})
    },

    async unlink() {
      let { widget: { id }} = this
      await new Bubble(this).go('removeWidgetFromUser', { id })
      this.$emit('deleted')
    },
    
    getChoices: parameter => parameter.choices || (parameter.choices = [{
      name: ''
    }]),

    async save() {
      try {
        this.saving = true
        let time = Date.now()
        await this.$axios.$patch(this.apiUrl, {
          ...mapValues(pick(this.widget, ['setup', 'display', 'template', 'tie']), JSON.stringify), name: this.widget.name
        }, {
          headers: {
            //TODO: Remove secret token to inner API!
            'Authorization': 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20'
          }
        })
        this.changed = false
        this.saved = true
        setTimeout(() => this.saved = false, 3000)
      } finally {
        this.saving = false
      }
    }
  },

}

</script>