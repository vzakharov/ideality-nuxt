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
        <div v-for="(example, i) in setup.examples" :key="i">
          <!-- <TextInputs
            :object="example" :fields="{
              input: { caption: display.inputCaption, placeholder: 'Something the user might input' },
              output: { caption: display.outputCaption, placeholder: 'Something the setup can output', multiline: true}
            }"
          /> -->
          <WidgetProper
            v-bind="{
              config, id,
              startingInput: example.input,
              startingOutput: example.output,
            }"
            @change="Object.assign(example, $event)"
          />
          <button class="btn btn-light" @click="setup.examples = without(setup.examples, example)" v-text="'Delete'"/>
          <hr/>
        </div>
        <button class="btn btn-primary" @click="setup.examples = [...setup.examples, {}]" v-text="'Add'"/>
      </template>

      <TextInputs v-if="section=='display'" :object="display" :fields="{
        name: { caption: 'Widget name', placeholder: 'My new widget' },
        inputCaption: { caption: 'Caption for user input', placeholder: 'e.g. “Tell us about yourself”'},
        inputPlaceholder: { caption: 'Placeholder for user input', placeholder: 'e.g. “I am a ...”'},
        outputCaption: { caption: 'Caption for AI output', placeholder: 'e.g. “Here’s what our product can do for you”'}
      }"/>

      <TextInputs v-if="section=='template'" :object="template" :fields="{
        apiKey: { caption: 'API key', placeholder: 'sk-...' },
        instruction: { caption: 'Instruction for AI', placeholder: 'e.g. “Suggest uses for a product based on a product description and user personas”', multiline: true},
        inputPrefix: { caption: 'Prefix for input' },
        outputPrefix: { caption: 'Prefix for output' }
      }"/>

    </div>

    <!-- YAML editor -->
    <div v-else>
      <textarea
        style="font-family: monospace!important; font-size: smaller;"
        class="text-monospace w-100"
        rows="20"
        v-model.lazy="configYaml"
      />
    </div>

    <!-- Footer -->
    <div class="d-flex flex-row py-2 fixed-bottom bg-light container-sm mx-auto" style="max-width: 800px">
      <button :class="{ btn: true, 'btn-danger': !saveDisabled }" :disabled="saveDisabled" v-text="saving ? 'Saving...' : saved && !changed ? 'Saved!' : 'Save' " @click="save"/>
      <div class="form-check align-self-center">
        <input class="form-check-input" type="checkbox" id="edit-yaml" v-model="editYaml"/>
        <label for="edit-yaml" v-text="'Edit as YAML'"/>
      </div>
    </div>

  </div>
</template>

<script>

// import TextInputs from '@/components/TextInputs.vue'

import { assign, mapValues, pickBy, without } from 'lodash'
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
      section: 'setup'
    }
  },

  methods: {
    async save() {
      try {
        this.saving = true
        await this.$axios.$patch('https://ideality.app/version-test/api/1.1/obj/widget/' + this.id, {
          ...mapValues(this.config, JSON.stringify)
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

  watch: {
    config: {
      deep: true,
      handler() {
        this.changed = true
      }
    }
  },

  computed: {

    configYaml: {
      get() { return yaml.dump(this.config) },

      set(value) { assign(this.config, yaml.load(value)) }
    },

    saveDisabled() { return !this.changed || this.saving },

    setup() { return this.config.setup },
    display() { return this.config.display },
    template() { return this.config.template },

  }

}

</script>