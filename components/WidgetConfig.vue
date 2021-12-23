<template>
  <b-container fluid="lg" class="pt-3">
    <b-row>
      <Breadcrumbs v-if="!ephemeral"/>
      <b-navbar>
        <b-navbar-brand>
          <h2 class="ideality-widget-heading">
            <span v-if="widget.name" v-text="widget.name"/>
            <em v-else>Unnamed widget</em>
          </h2>
        </b-navbar-brand>
        <b-navbar-nav>
          <b-nav-form v-if="saved || changed">
            <b-button 
              :variant="saveDisabled ? 'light' : 'primary'" 
              :disabled="saveDisabled" 
              v-text="saving ? 'Saving...' : saved && !changed ? 'Saved!' : 'Save' " 
              @click="save"
            />
          </b-nav-form>
          <b-nav-form v-if="ephemeral && href && !changed">
            <b-button
              variant="secondary-outline"
              v-text="'Preview in new tab'"
              target="_blank"
              size="small"
              class="gray"
              v-bind={href}
            />
          </b-nav-form>
          <b-nav-item-dropdown v-if="!ephemeral" text="Actions" variant="outline-secondary">
            <b-dropdown-item :to="{ name: 'widget-new', query: { template: widget.id }}">
              Clone
            </b-dropdown-item>
            <b-dropdown-item @click="unlink" variant="danger">
              Delete
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-navbar>
      <small v-if="!ephemeral" class="text-muted">
        <p class="mb-0">
          Id: <Copiable v-model="widget.id"/>
        </p>
        <p>
          Embed:
          <nuxt-link class="text-secondary" :to="embedRoute" v-text="'https://ideality.app'+$router.resolve(embedRoute).href"/>
        </p>
      </small>
    </b-row>
    <b-row>
      <ul class="nav nav-pills ms-4">
        <li :class="{'nav-item': true, 'd-md-none': item.slug=='test'}"
          v-for="item in [
            ...( isAdmin ? [
              { slug: 'admin', caption: 'Admin' },
            ] : [] ),
            { slug: 'yaml', caption: 'YAML'},
            ...[
              { slug: 'native', caption: 'Native settings', hideIf: !widget.isNative },
            ].filter(item => !item.hideIf),
            ...[
              { slug: 'setup', caption: 'AI settings' },
              { slug: 'display', caption: 'Display settings'},
            ].filter(item => vm[item.slug]),
            ... ephemeral ? [] : [
            { slug: 'slate', caption: 'Slate settings', hideIf: !this.isAdmin},
            { slug: 'stats', caption: 'Stats'},
            ],
            { slug: 'test', caption: 'Preview'}
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
    </b-row>
    <b-row>    
      <b-col class="mx-3">
        <b-row>      
          <div v-if="section!='test'">

            <div class="bg-light p-3 mt-3 border shadow">
              <WidgetAdmin v-if="section=='admin'" v-bind="{widget}" v-on="{please}"/>

              <WidgetNativeConfig v-if="section=='native'" v-bind="{widget}" v-on="{please}"/>
              
              <template v-if="section=='display'">
                <WidgetDisplayConfig :context="{widget}" v-model="display" v-on="{please}"/>
              </template>
              <WidgetSetup v-if="section=='setup'" v-model="setup" v-bind="{widget}"/>
              <SlateConfig v-if="section=='slate'" v-model="widget.slate" v-bind="{widget}"/>


              <WidgetStats :value="{widget}" v-if="section=='stats'"/>


              <div v-if="section=='yaml'">
                <CodeInput v-model="widgetYaml"/>
              </div>
            </div>
          </div>
          <template v-if="section=='test'">
            <WidgetBox>
              <WidgetProper v-bind="{widget}"/>
            </WidgetBox>
            <slot/>
          </template>


        </b-row>
      </b-col>
      <b-col class="d-none d-md-block mt-3">
        <h5>Widget preview</h5>
        <WidgetBox>
          <WidgetProper v-bind="{widget}"/>
        </WidgetBox>
        <slot/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

// import ObjectConfig from '@/components/ObjectConfig.vue'

import { assign, findIndex, get, last, mapValues, omit, pick, without } from 'lodash'
import yaml from 'js-yaml'
import Bubble from '~/plugins/bubble'

// import VueClipboard from 'vue-clipboard2'
// Vue.use(VueClipboard)

export default {

  props: ['id', 'href', 'value', 'ephemeral', 'saver'],

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
      section: this.$route.query['section'] || 'setup'
    }
  },

  watch: {

    // changed() {
    //   // window.onbeforeunload = this.changed ? () => { return "" } : undefined
    // },

    widget: {
      deep: true,
      handler(widget, old) {
        // // debugger
        // if ( old == this.oldConfig )
        //   return
        this.changed = true
        // this.oldConfig = this.widget
        // this.widget = {...widget}
        this.$emit('input', this.widget)
      }

    }
  },

  computed: {

    embedRoute() {
      return { name: 'widget-id-embed', params: { id: this.widget.slug || this.widget.id }}
    },

    widgetYaml: {
      get({ isAdmin } = this) { 
        console.log({isAdmin})
        let cutWidget = pick(this.widget, [
          'name', 'display', 'setup', 'slate'
          // ...isAdmin ? ['slate'] : []
        ])
        console.log({cutWidget})
        return yaml.dump(cutWidget) 
      },

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
      let { response: { newWidget }} = await this.bubble.go('wf/cloneWidget', { id })
      console.log({newWidget})
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

    async save() {
      try {
        let { saver, widget } = this
        this.saving = true
        if ( saver ) {
          await saver(widget)
        } else {
          // widget.display.name = widget.name
          await this.$axios.$patch(this.apiUrl, {
            ...omit(widget, Bubble.camelcasedReservedProperties),
            ...mapValues(pick(widget, ['setup', 'display', 'slate', 'tie', 'stats']), JSON.stringify)
          })          
        }
        this.changed = false
        this.saved = true
        setTimeout(() => this.saved = false, 3000)
      } catch(error) {
        window.alert("Could not save: " + JSON.stringify(error))
      } finally {
        this.saving = false
      }
    }
  },

}

</script>