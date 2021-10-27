<template>
  <div class="bg-light p-2">
    <template v-if="!duringSetup">
      <!-- <h3 v-text="widget.display.name"/> -->
      <p v-text="widget.display.description"/>
    </template>
    <LabeledInput
      v-model="content.input"
      v-bind="{
        id: 'user-input',
        caption: display.inputCaption,
        placeholder: display.inputPlaceholder,
        labelTag: 'h3',
        disabled: generating,
        multiline: true,
        removeNewLines: true,
        rows: 1
      }"
      @keydown.native.enter="generate"
      ref="input"
    />

    <template>
      <div v-if="!generating">
        <b-button :variant="generated ? 'outline-primary' : 'primary'" v-text="generated && content.output ? 'Try again' : 'Suggest'" 
          :disabled="!content.input || !canRunWidget"
          @click="generate"
        />
        <b-button variant="light" v-text="'🎲'"
          @click="content={}; generate()"
          :disabled="!canRunWidget"
        />
      </div>
      <b-spinner v-else class="spinner-grow text-danger"/>
    </template>
    <slot/>

    <LabeledInput v-if="content.output || duringSetup" 
      v-model="content.output"
      v-bind="{
        multiline: true,
        caption: display.outputCaption,
        disabled: generating
      }"
      rows="1"
      @keydown.native.ctrl.enter="last(content.output)=='-' && generate()"
    />

    <template v-if="generated && content.output && !duringSetup">
      <div v-if="showOutro">
        <h4 class="pt-3" v-text="display.preCTA"/>
        <b-button variant="primary" size="lg"
          :href="
            display.CTAType=='link' ?
            encodeURI(display.CTAContent.replace('<input>', content.input).replace('<output>', content.output))
            : `mailto:${display.leadgenEmail}?subject=${encodeURI(content.input)}&body=Hi, I got the following AI suggestions to my request:\n\n${encodeURI(content.output)}\n\nIs that correct?`" 
          target="_blank"
          v-text="display.CTA"
        />
      </div>
    </template>

  </div>
</template>

<script>

  import { assign, last, pick} from 'lodash'
  // import { BIconDice5 } from 'bootstrap-vue'

  export default {

    // components: {BIconDice5},
    props: ['widget', 'value', 'duringSetup', 'apiKey', 'code'],

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
      last,
      async generate() {

        this.generating = true
        

        try {
          let { id, setup, template } = this.widget
          let { duringSetup, apiKey } = this
          
          let { code } = this
          if (code)
            code = code.id

          let { input, output } = this.content

          const append = what => last(what) == '-'
          const cut = what => what.slice(0, -1)
          
          const appendInput = append(input) || undefined

          if ( appendInput )
            input = cut(input)

          output = (
            !appendInput && append(output)
          ) ? cut(output) : undefined

          let body = { 
              id, input, output, appendInput, duringSetup, widget: {id, setup, template }, 
              apiKey, iddqd: this.godMode, code
            }
          
          
          let { data: { content, runsLeft }} = await this.$axios.post('api/widget/generate', body)
          assign(this, { content })
          // console.log(runsLeft)
          if ( runsLeft )
            this.$set(this.code, 'runsLeft', runsLeft)
          
          this.generated = true
        } catch(err) {
          console.log(err)
        } finally {
          this.generating = false
        }

      }

    },

    // computed: {
    //   canRunWidget() { return this.godMode || this.apiKey }
    // },

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