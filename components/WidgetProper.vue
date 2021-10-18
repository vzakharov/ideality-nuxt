<template>
  <div>
    <TextInput
      v-bind="{
        object: self,
        _key: 'input',
        id: 'user-input',
        caption: display.inputCaption,
        placeholder: display.inputPlaceholder,
        labelTag: 'h3',
        disabled: generating
      }"
    />

    <div v-if="!generating">
      <b-button variant="primary" v-text="'Suggest'" :disabled="!input"
        @click="generate"
      />
      <b-button variant="light" v-text="'Give me an example'"
        @click="input=''; generate()"
      />
    </div>
    <b-spinner v-else class="spinner-grow text-danger"/>

    <TextInput v-if="output" v-bind="{
      object: self,
      _key: 'output',
      multiline: true,
      caption: display.outputCaption
    }"/>
  </div>
</template>

<script>

  import { assign, pick} from 'lodash'

  export default {

    props: ['config', 'id', 'startingInput', 'startingOutput'],

    data() { return {
      self: this,
      input: this.startingInput,
      output: this.startingOutput,
      generating: false
    }},

    methods: {

      async generate() {

        this.generating = true
        this.output = ''

        try {
          let { id, input} = this

          assign(this, ( 
            await this.$axios.post('api/widget/generate', { id, input } ) 
          ).data)
        } finally {
          this.generating = false
        }

      }

    },

    computed: {
      display() { return this.config.display }
    },

    watch: {
      input() { this.$emit('change', {input: this.input, output: this.output })},
      output() { this.$emit('change', {input: this.input, output: this.output })},
    }

  }

</script>

<style>
.btn {
  margin-right: 10px;
}
</style>