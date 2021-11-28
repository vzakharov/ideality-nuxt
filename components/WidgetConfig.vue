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
            <p class="mb-0">
              Id: <Copiable v-model="widget.id"/>
            </p>
            <p>
              Embed:
              <nuxt-link class="text-secondary" :to="embedRoute" v-text="'https://ideality.app'+$router.resolve(embedRoute).href"/>
            </p>
          </small>
        </b-nav-form>
      </b-navbar-nav>
      <b-navbar-nav class="ms-auto">
        <b-nav-form v-if="saved || changed">
          <b-button 
            :variant="saveDisabled ? 'light' : 'primary'" 
            :disabled="saveDisabled" 
            v-text="saving ? 'Saving...' : saved && !changed ? 'Saved!' : 'Save' " 
            @click="save()"
          />
        </b-nav-form>
        <b-nav-item-dropdown text="More" variant="outline-secondary">
          <b-dropdown-item :to="{ name: 'widget-new', query: { template: widget.id }}">
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
            v-for="item in [
              ...( $auth.user.isAdmin ? [{ slug: 'admin', caption: 'Admin' }] : [] ),
              ...[
                { slug: 'display', caption: 'Display settings'},
                { slug: 'setup', caption: 'AI settings' },
                { slug: 'slate', caption: 'Slate settings'}
              ].filter(item => vm[item.slug] && !item.hideIf),
              { slug: 'stats', caption: 'Stats'},
              { slug: 'test', caption: 'Preview'},
              { slug: 'yaml', caption: 'YAML', testing: true}
            ].filter(item=>!item.testing || queryTags.testing)"
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

        <WidgetAdmin v-if="section=='admin'" v-bind="control(widget)" v-on="{assign}"/>

        <template v-if="section=='display'">
          <LabeledInput v-model="widget.name" caption="Name" placeholder="Name for your own reference, not displayed for the user"/>
          <WidgetDisplayConfig :context="{widget}" v-model="display"/>
        </template>
        <WidgetSetup v-if="section=='setup'" v-model="setup" v-bind="{widget}"/>
        <SlateConfig v-if="section=='slate'" v-model="widget.slate" v-bind="{widget}"/>


        <WidgetStats :value="{widget}" v-if="section=='stats'"/>

        <WidgetBox v-if="section=='test'">
          <WidgetProper v-bind="{widget}"/>
        </WidgetBox>

        <div v-if="section=='yaml' && queryTags.testing">
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

// import VueClipboard from 'vue-clipboard2'
// Vue.use(VueClipboard)

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

    // changed() {
    //   // window.onbeforeunload = this.changed ? () => { return "" } : undefined
    // },

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
      return { name: 'widget-id-embed', params: { id: this.widget.slug || this.widget.id }}
    },

    widgetYaml: {
      get() { return yaml.dump(omit(this.widget, 'tie')) },

      set(value) { assign(this.widget, yaml.load(value)) }
    },

    exampleIndex() { return findIndex(this.examples, this.example) },

    saveDisabled() { return !this.changed || this.saving },

    apiUrl() { return process.env.NUXT_ENV_BUBBLE_URL + 'obj/widget/' + this.widget.id },

    setup() { return this.widget.setup },
    display() { return this.widget.display },
    slate() { return this.widget.slate },

    examples: {
      get() { return this.setup.examples || [] },
      set(value) { this.setup.examples = value }
    },

    parameters: {
      get() { return this.slate.parameters || []},
      set(value) { this.slate.parameters = value }
    }


  },

  
  methods: {

    async clone() {
      let { id } = this.widget
      let { response: { newWidget }} = await this.$axios.$post(process.env.NUXT_ENV_BUBBLE_URL+'wf/cloneWidget', { id })
      console.log(newWidget)
      this.$router.push({...this.$route, name: 'widget-id-config', params: { id: newWidget._id }})
    },

    async unlink() {
      let { widget: { id }} = this
      await new Bubble(this).go('removeWidgetFromUser', { id })
      this.$emit('deleted')
    },
    
    getChoices: parameter => parameter.choices || (parameter.choices = [{
      name: ''
    }]),

    async save({ widget } = this) {
      try {
        console.log({ widget })
        this.saving = true
        widget.display.name = widget.name
        let { name, runsLeft, inToolbox } = widget
        await this.$axios.$patch(this.apiUrl, {
          name, runsLeft, inToolbox,
          ...mapValues(pick(widget, ['setup', 'display', 'slate', 'tie']), JSON.stringify)
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