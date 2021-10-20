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

      <template v-if="section=='setup'">
        <TextInputs :object="setup" :fields="{
          context: { caption: 'Context for AI', placeholder: 'e.g. “Product description: ...”', multiline: true },
        }"/>
        <h4 v-text="'Examples for AI to use'"/>
        <ul class="nav nav-pills">
          <li v-for="(e, i) in examples" :key="i" class="nav-item">
            <a href="#"
              :class="{'nav-link':true, active: e == example }"
              v-text="i+1"
              @click="example=e"
            />
          </li>
          <button v-text="'Add'" :class="`mx-2 btn ${examples.length ? 'btn-outline-secondary' : 'btn-primary'}`" 
            @click="
              examples = [...examples, {}];
              example = examples[examples.length-1]
            "/>
          <button v-text="'Delete'" class="mx-2 btn btn-outline-danger align-right" 
            @click="deleteExample"
          />
        </ul>
        <div v-if="example">
          <WidgetProper
            v-bind="{
              config, id,
              prefill: example
            }"
            :key="example.input"
            @change="Object.assign(example, $event)"
          />
          <hr/>
        </div>
      </template>

      <TextInputs v-if="section=='display'" :object="display" :fields="{
        name: { object: config, caption: 'Widget name', placeholder: 'My new widget' },
        inputCaption: { caption: 'Caption for user input', placeholder: 'e.g. “Tell us about yourself”'},
        inputPlaceholder: { caption: 'Placeholder for user input', placeholder: 'e.g. “I am a ...”'},
        outputCaption: { caption: 'Caption for AI output', placeholder: 'e.g. “Here’s what our product can do for you”'}
      }"/>

      <template v-if="section=='template'">

        <TextInputs :object="template" :fields="{
          apiKey: { caption: 'API key', placeholder: 'sk-...' },
          instruction: { caption: 'Instruction for AI', placeholder: 'e.g. “Suggest uses for a product based on a product description and user personas”', multiline: true},
          inputPrefix: { caption: 'Prefix for input' },
          outputPrefix: { caption: 'Prefix for output' }
        }"/>

        <!-- <TemplateParts v-model="template.parts"/> -->
        <ListOfComponents 
          v-model="template.parts"
          component="TemplatePart"
          title="part"
          :defaultItem="{
            prompt: ''
          }"
          :context="{parameters}"
        />

        <!-- <div v-for="part in template.parts" :key="part.prompt">
          <TextInput v-model="part.prompt"/>
        </div>
        <button v-text="'Add part'" :class="'mx-2 btn btn-outline-secondary'" 
          @click="template.parts = [{}];"
        /> -->

        <h4>Parameters</h4>

        <div v-for="parameter in parameters" :key="parameter.name">
          <TextInputs :object="parameter" :fields="{
            title: 'Title',
            type: { caption: 'Type', choices: ['text', 'choices'] }
          }"/>
          <TextInput v-if="parameter.type=='choices'"
            v-bind="{
              caption: 'Choices',
              placeholder: 'Enter choices separated by commas',
              value: (parameter.choices || []).join()
            }"
            @input="parameter.choices = $event.split(',')"
          />
          <button v-text="'Delete parameter'" class="mx-2 btn btn-outline-danger align-right" 
            @click="$set(template, 'parameters', without(parameters, parameter))"
          />
          <hr/>
        </div>
        <button v-text="'Add parameter'" :class="'mx-2 btn btn-outline-secondary'" 
          @click="$set(template, 'parameters', [...parameters, {}])"
        />
        </template>


    </div>

    <!-- YAML editor -->
    <div v-else>
      <textarea
        style="font-family: monospace!important; font-size: smaller;"
        class="text-monospace w-100"
        rows="25"
        v-model.lazy="configYaml"
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

// import TextInputs from '@/components/TextInputs.vue'

import { assign, findIndex, get, last, mapValues, pickBy, without } from 'lodash'
import yaml from 'js-yaml'

export default {

  props: ['id', 'config'],

  data() { 

    assign(this, { without, yaml })

    return {
      changed: false,
      saving: false,
      saved: false,
      editYaml: false,
      deleteRequested: false,
      example: get(this, 'config.setup.examples[0]'),
      oldConfig: null,
      section: 'setup'
    }
  },

  watch: {

    changed() {
      // window.onbeforeunload = this.changed ? () => { return "" } : undefined
    },

    config: {
      deep: true,
      handler(config, old) {
        if ( old == this.oldConfig )
          return
        this.changed = true
        this.oldConfig = this.config
        this.config = {...config}
      }

    }
  },

  computed: {

    configYaml: {
      get() { return yaml.dump(this.config) },

      set(value) { assign(this.config, yaml.load(value)) }
    },

    exampleIndex() { return findIndex(this.examples, this.example) },

    saveDisabled() { return !this.changed || this.saving },

    apiUrl() { return 'https://ideality.app/version-test/api/1.1/obj/widget/' + this.id },

    setup() { return this.config.setup },
    display() { return this.config.display },
    template() { return this.config.template },

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
      let { id } = this
      let { response: { newWidget }} = await this.$axios.$post('https://ideality.app/version-test/api/1.1/wf/cloneWidget', { id })
      console.log(newWidget)
      this.$router.push({...this.$route, name: 'widget-id', params: { id: newWidget._id }})
    },
    
    deleteExample() {
      debugger
      let {example, exampleIndex} = this
      this.examples = without(this.examples, example);

      let {examples} = this
      this.example = exampleIndex < examples.length ? examples[exampleIndex] : examples.length ? last(examples) : null
    },

    getChoices: parameter => parameter.choices || (parameter.choices = [{
      name: ''
    }]),

    async save() {
      try {
        this.saving = true
        await this.$axios.$patch(this.apiUrl, {
          ...mapValues(this.config, JSON.stringify), name: this.config.name
        }, {
          headers: {
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