<template>
  <div>
    <button :class="{ btn: true, 'btn-danger': !saveDisabled }" :disabled="saveDisabled" v-text="saving ? 'Saving...' : saved && !changed ? 'Saved!' : 'Save' " @click="save"/>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="edit-yaml" v-model="editYaml"/>
      <label for="edit-yaml" v-text="'Edit YAML'"/>
    </div>
    <div v-if="!editYaml">
      <h3 v-text="'General settings'"/>
      <TextInputs :object="config" :fields="{
        name: { caption: 'Widget name', placeholder: 'My new widget' },
        apiKey: { caption: 'API key', placeholder: 'sk-...' },
      }"/>
      <h3 v-text="'Display settings'"/>
      <TextInputs :object="config" :fields="{
        inputCaption: { caption: 'Caption for user input', placeholder: 'e.g. “Tell us about yourself”'},
        inputPlaceholder: { caption: 'Placeholder for user input', placeholder: 'e.g. “I am a ...”'},
        outputCaption: { caption: 'Caption for AI output', placeholder: 'e.g. “Here’s what our product can do for you”'}
      }"/>
      <h3 v-text="'AI settings'"/>
      <TextInputs :object="config" :fields="{
        instruction: { caption: 'Instruction for AI', placeholder: 'e.g. “Suggest uses for a product based on a product description and user personas”', multiline: true},
        context: { caption: 'Context for AI', placeholder: 'e.g. “Product description: ...”', multiline: true },
      }"/>
      <h4 v-text="'Examples for AI to use'"/>
      <div v-for="(example, i) in config.examples" :key="i">
        <TextInputs
          :object="example" :fields="{
            input: { caption: 'Input', placeholder: 'Something the user might input' },
            output: { caption: 'Output', placeholder: 'Something the config can output', multiline: true}
          }"
        />
        <button class="btn btn-light" @click="config.examples = without(config.examples, example)" v-text="'Delete'"/>
        <hr/>
      </div>
      <button class="btn btn-primary" @click="config.examples = [...config.examples, {}]" v-text="'Add'"/>
    </div>
    <div v-else>
      <textarea-autosize
        style="font-family: monospace!important"
        class="text-monospace"
        v-model="configYaml"
      />
    </div>
  </div>
</template>

<script>

// import TextInputs from '@/components/TextInputs.vue'

import { assign, without } from 'lodash'
import yaml from 'js-yaml'

export default {

  props: ['config', 'id'],

  data() { 

    console.log(this.config.$data)

    assign(this, { without, yaml })

    return {
      changed: false,
      saving: false,
      saved: false,
      editYaml: false
    }

  },

  methods: {
    async save() {
      try {
        this.saving = true
        await this.$axios.$patch('https://ideality.app/version-test/api/1.1/obj/widget/' + this.id, {
          config: JSON.stringify(this.config)
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

      set(value) { this.config =$emit('loadYaml', { value }) }
    },
    saveDisabled() { return !this.changed || this.saving }
  }

}

</script>