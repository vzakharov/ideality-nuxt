<template>
  <div class="bg-light p-2">
    <template v-if="!duringSetup">
      <!-- <h3 v-text="widget.display.name"/> -->
      <p v-if="widget.display.description" v-text="widget.display.description"/>
    </template>
    <LabeledInput
      v-model="content.input"
      v-bind="{
        id: 'widget-input',
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
    <b-alert show v-if="error && !hide.error" variant="danger">
      <h5>Oops!</h5>
      <p v-html="$md.render(error.message)"/>
      <b-button variant="outline-secondary" size="sm"
        @click="$set(hide, 'error', true)"
      >Got it</b-button>
    </b-alert>

    <LabeledInput v-if="content.output || duringSetup" 
      id="widget-output"
      v-model="content.output"
      v-bind="{
        multiline: true,
        caption: display.outputCaption,
        disabled: generating
      }"
      rows="1"
      @keydown.native.ctrl.enter="last(content.output)=='-' && generate()"
    />

    <template v-if="display.CTA && generated && content.output && !duringSetup">
      <div v-if="showOutro">
        <h4 class="pt-3" v-text="display.preCTA"/>
        <b-button variant="primary" size="lg"
          :href="
            display.CTAType=='link' ?
            encodeURI(
              display.CTAContent
              .replace('<input>', content.input)
              .replace('<output>', content.output)
              .replace('<query>', new window.URLSearchParams($route.query).toString())
            )
            : `mailto:${display.leadgenEmail}?subject=${encodeURI(content.input)}&body=Hi, I got the following AI suggestions to my request:\n\n${encodeURI(content.output)}\n\nIs that correct?`" 
          target="_blank"
          v-text="display.CTA"
        />
      </div>
    </template>

  </div>
</template>

<script>

  import { assign, get, last, pick} from 'lodash'
  // import { BIconDice5 } from 'bootstrap-vue'

  export default {

    // components: {BIconDice5},
    props: ['widget', 'value', 'duringSetup', 'apiKey', 'code', 'go', 'dontFocusOnOutput'],

    data() { 
      let content = this.value || {}
      console.log(content)
      let { display } = this.widget
      let data = {
        error: null,
        generating: false,
        generated: false,
        showOutro: true,
        hide: {},
        content,
        display
      }
      return data
    },

    mounted() {
      if (this.go)
        this.$nextTick(this.generate)
    },

    methods: {
      last,
      async generate() {

        this.generating = true
        this.error = null

        try {
          let { id, setup, template } = this.widget
          let { duringSetup, apiKey } = this
          
          let { code } = this.$route.query

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
              input, output, appendInput, duringSetup, widget: {id, setup, template }, 
              apiKey, code, ...this.queryTags
            }
          
          
          let { data: { content, runsLeft }} = await this.$axios.post('api/widget/generate', body)
          assign(this, { content })
          // console.log(runsLeft)
          if ( runsLeft && this.code)
            this.$set(this.code, 'runsLeft', runsLeft)
          
          this.generated = true
          this.$emit('generated')
          if ( content.output && !this.dontFocusOnOutput)
            this.focus('widget-output')
        } catch(e) {
          console.log(e)
          let error = get(e, 'response.data.error')
          if ( error )
            assign(this, {error})
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