<template>
  <div>
    <LabeledInput
      v-model="content.input"
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

    <LabeledInput v-if="content.output" 
      v-model="content.output"
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

    props: ['config', 'id', 'value'],

    data() { 
      let { input, output } = this.value || {}
      let { display } = this.config
      let data = {
        generating: false,
        content: { input, output },
        display
      }
      return data
    },

    methods: {

      async generate() {

        this.generating = true
        this.output = ''

        try {
          let { id } = this
          let { input } = this.content

          this.content = ( 
            await this.$axios.post('api/widget/generate', { id, input } ) 
          ).data
        } finally {
          this.generating = false
        }

      }

    },

    watch: {
      content: {
        deep: true, 
        handler () { this.$emit('input', this.content )}
      }
    }

  }

</script>

<style>
.btn {
  margin-right: 10px;
}
</style>