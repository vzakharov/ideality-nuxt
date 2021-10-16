<template>
  <div>
    <TextInput
      v-bind="{
        object: self,
        _key: 'input',
        id: 'user-input',
        caption: config.inputCaption,
        placeholder: config.inputPlaceholder,
        labelTag: 'h3',
        disabled: generating
      }"
    />

    <div v-if="!generating">
      <b-button variant="primary" v-text="'Suggest'" :disabled="!input"
        @click="generate"
      />
      <b-button variant="light" v-text="'Show me how'"
        @click="input=''; generate()"
      />
    </div>
    <b-spinner v-else class="spinner-grow text-danger"/>

    <TextInput v-if="output" v-bind="{
      object: self,
      _key: 'output',
      multiline: true,
      caption: config.outputCaption
    }"/>
  </div>
</template>

<script>

  import { assign } from 'lodash'

  export default {

    props: ['config', 'id'],

    data() { return {
      self: this,
      output: null,
      input: null,
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

    }

  }

</script>

<style>
.btn {
  margin-right: 10px;
}
</style>