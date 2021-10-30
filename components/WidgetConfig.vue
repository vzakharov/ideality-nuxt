<template>
  <div>
    <div v-if="!editYaml">
      <ul class="nav nav-tabs">
        <li class="nav-item" 
          v-for="item in [
            { slug: 'setup', caption: 'Algo settings' },
            { slug: 'display', caption: 'Display settings'},
            { slug: 'template', caption: 'Template settings'}
          ].filter(item=>vm[item.slug])"
          :key="item.slug"
        >
          <a href="#"
            :class="{
              'nav-link': true,
              active: section == item.slug
            }"
            v-text="item.caption"
            @click="section = item.slug"
          />
        </li>
      </ul>

      <WidgetSetup v-if="section=='setup'" v-model="setup" v-bind="{widget}"/>

      <WidgetDisplayConfig v-if="section=='display'" :context="{widget}" v-model="display"/>
      <!-- <ObjectConfig v-if="section=='display'" v-model="display" :fields="{
        name: { caption: 'Display name', placeholder: 'Shows up as an heading' },
        description: { caption: 'Description (for end user)', placeholder: 'The text that will show up in the widget', multiline: true},
        sampleDescription: { hide: !widget.isExample, caption: 'Description (for owners)', multiline: true},
        inputCaption: { caption: 'Caption for user input', placeholder: 'e.g. “Tell us about yourself”'},
        inputPlaceholder: { caption: 'Placeholder for user input', placeholder: 'e.g. “I am a ...”'},
        outputCaption: { caption: 'Caption for AI output', placeholder: 'e.g. “Here’s what our product can do for you”'},
        preCTA: { caption: 'Line before CTA button' },
        CTA: { caption: 'Text on the CTA button' },
        CTAType: { choices: ['link', 'email']},
        CTAEmail: { hide: !widget.CTAType!='email', caption: 'Email address to send the email to' },
        CTAContent: { caption: 'Text to be included after CTA', placeholder: 'Use <input> and <output> to refer to the input and output, respectively.', multiline: true }
      }"/> -->

      <TemplateConfig v-if="section=='template'" v-model="widget.template" v-bind="{widget}"/>


    </div>

    <!-- YAML editor -->
    <div v-else>
      <textarea
        style="font-family: monospace!important; font-size: smaller;"
        class="text-monospace w-100"
        rows="25"
        v-model.lazy="widgetYaml"
      />
    </div>

    <!-- Footer -->
    <div class="d-flex flex-row pt-4 container-sm mx-auto" style="max-width: 800px">
      <b-button :variant="editYaml ? 'secondary' : 'outline-secondary'" v-text="'Edit as YAML'" @click="editYaml = !editYaml"/>
      <b-button variant="outline-secondary" v-text="'Clone'" @click="clone"/>
      <b-button v-if="saved || changed" :variant="!saveDisabled ? 'primary' : 'light'" :disabled="saveDisabled" v-text="saving ? 'Saving...' : saved && !changed ? 'Saved!' : 'Save' " @click="save"/>
      <b-button v-if="!deleteRequested" variant="outline-danger" v-text="'Delete'" @click="deleteRequested=true; window.setTimeout(() => {deleteRequested = false}, 3000)"/>
      <b-button v-else variant="danger" v-text="'Are you sure? This cannot be undone!'" @click="$axios.delete(apiUrl); $emit('deleted')"/>
    </div>

  </div>
</template>

<script>

// import ObjectConfig from '@/components/ObjectConfig.vue'

import { assign, findIndex, get, last, mapValues, omit, pick, without } from 'lodash'
import yaml from 'js-yaml'

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
      section: this.$route.query['subsection'] || 'setup'
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
    
    getChoices: parameter => parameter.choices || (parameter.choices = [{
      name: ''
    }]),

    async save() {
      try {
        this.saving = true
        let time = Date.now()
        await this.$axios.$patch(this.apiUrl, {
          ...mapValues(pick(this.widget, ['setup', 'display', 'template', 'tie']), JSON.stringify), name: this.widget.name || 'Unnamed widget'
        }, {
          headers: {
            //TODO: Remove secret token to inner API!
            'Authorization': 'Bearer d51e2dc8a6dd89ef0fc9f36a9f3d5c20'
          }
        })
        this.changed = false
        this.saved = true
      } finally {
        this.saving = false
      }
    }
  },

}

</script>