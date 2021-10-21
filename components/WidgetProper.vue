<template>
  <div>
    <InputWithLabel
      v-model="vm.input"
      v-bind="{
        id: 'user-input',
        caption: display.inputCaption,
        placeholder: display.inputPlaceholder,
        labelTag: 'h3',
        disabled: generating
      }"
    />

    <div v-if="!generating && canRunWidget">
      <b-button variant="primary" v-text="'Suggest'" :disabled="!input"
        @click="generate"
      />
      <b-button variant="light" v-text="'Give me an example'"
        @click="input=''; generate()"
      />
    </div>
    <b-spinner v-else class="spinner-grow text-danger"/>

    <InputWithLabel v-if="output" 
      v-model="vm.output"
      v-bind="{
        multiline: true,
        caption: display.outputCaption
      }"
    />
  </div>
</template>

<script>

  import { assign, pick} from 'lodash'

  export default {

    props: ['config', 'id', 'prefill'],

    data() { 
      let data = {
        generating: false
      }
      assign(data, this.prefill)
      return data
    },

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