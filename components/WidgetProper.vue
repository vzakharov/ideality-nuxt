<template>
  <div>
    <LabeledInput
      v-model="content.input"
      v-bind="{
        id: 'user-input',
        caption: display.inputCaption,
        placeholder: display.inputPlaceholder,
        labelTag: 'h3',
        disabled: generating,
        multiline: true
      }"
    />

    <template>
      <div v-if="!generating">
        <b-button :variant="generated ? 'outline-primary' : 'primary'" v-text="generated ? 'Try again' : 'Suggest'" :disabled="!content.input"
          @click="generate"
        />
        <b-button :variant="!generated ? 'light' : 'text-secondary'" v-html="!generated ? 'Show me how' : '<small>Show another example</small>'"
          @click="content={}; generate()"
        />
      </div>
      <b-spinner v-else class="spinner-grow text-danger"/>
    </template>

    <LabeledInput v-if="content.output || duringSetup" 
      v-model="content.output"
      v-bind="{
        multiline: true,
        caption: display.outputCaption,
        disabled: generating
      }"
    />

    <template v-if="false && generated && content.output && !duringSetup">
      <div v-if="showOutro" class="shadow rounded-3 bg-white m-3 mt-5 p-3">
        <h4 v-text="display.leadgenTitle" class="mt-3"/>
        <p v-text="display.leadgenLine1"/>
        <p class="fw-bold" v-text="display.leadgenLine2"/>
        <button class="btn btn-primary" 
          :href="`mailto:${display.leadgenEmail}?subject=${encodeURI(content.input)}&body=Hi, I got the following AI suggestions to my request:\n\n${encodeURI(content.output)}\n\nIs that correct?`" 
          target="_blank" v-text="display.leadgenCTA"
        />
      </div>
    </template>

  </div>
</template>

<script>

  import { assign, last, pick} from 'lodash'

  export default {

    props: ['widget', 'value', 'duringSetup'],

    data() { 
      let content = this.value || {}
      console.log(content)
      let { display } = this.widget
      let data = {
        generating: false,
        generated: false,
        showOutro: true,
        content,
        display
      }
      return data
    },

    methods: {

      async generate() {

        this.generating = true
        

        try {
          let { id, setup, template } = this.widget
          let { duringSetup } = this
          let { input, output } = this.content

          const append = what => last(what) == '$'
          const cut = what => what.slice(0, -1)
          
          const appendInput = append(input) || undefined

          if ( appendInput )
            input = cut(input)

          output = (
            !appendInput && append(output)
          ) ? cut(output) : undefined

          this.content = ( 
            await this.$axios.post('api/widget/generate', { id, input, output, appendInput, duringSetup, widget: {setup, template } } ) 
          ).data
          console.log(this.content)
          this.generated = true
        } catch(err) {
          console.log(err)
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