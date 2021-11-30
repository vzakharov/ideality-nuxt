<template>
  <div>
    <div class="bg-light p-2">
      <template v-if="!duringSetup">
        <p v-if="!omitDescription && widget.display.description" v-text="widget.display.description"/>
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
          removeNewLines: !widget.slate.multilineInput,
          rows: 1
        }"
        @keydown.native.enter.exact="!widget.slate.multilineInput && generate()"
        @keydown.native.ctrl.enter="generate()"
        @keydown.native.alt.enter="isRetry && tryAgain()"
        @input="changed=true"
        ref="input"
      />

      <LabeledInput v-if="content.output || duringSetup" 
        :id="widget.slug+'-widget-output'"
        v-model="content.output"
        v-bind="{
          multiline: true,
          caption: display.outputCaption,
          disabled: generating
        }"
        rows="1"
        @keydown.native.ctrl.enter="last(content.output)=='-' && generate()"
        @keydown.native.alt.enter="isRetry && tryAgain()"
      />

      <template>
        <div v-if="!generating">
          <b-button :variant="isRetry ? 'outline-primary' : 'primary'" v-text="isRetry ? 'Try again' : display.suggestCaption || 'Suggest'" 
            :disabled="!content.input || !canRunWidget"
            @click="isRetry ? tryAgain() : generate()"
          />
          <b-button class="text-muted" variant="light" v-text="'Inspire me!'"
            @click="inspire"
            :disabled="!canRunWidget"
          />
        </div>
        <b-spinner v-else class="spinner-grow text-danger"/>
      </template>
      <slot/>
      <b-alert show v-if="error && !hide.error" variant="danger">
        <h5>Oops!</h5>
        <p v-html="$md.render(error.message || JSON.stringify(error))"/>
        <b-button variant="outline-secondary" size="sm"
          @click="$set(hide, 'error', true)"
        >Got it</b-button>
      </b-alert>



      <template v-if="display.CTA && generated && content.output">

        <div v-if="showOutro">
          <h4 class="pt-3" v-text="display.preCTA"/>

          <template v-if="widget.isNative && display.native.componentName">
            <b-button variant="primary" size="lg"          
              v-b-modal.output-preview
              v-text="display.CTA"
            />
            <b-modal id="output-preview" size="xl" hide-footer :title="`${widget.name} preview`">
              <component :is="'Builder' + widget.display.native.componentName" v-bind="{widget, content}" :key="content.output"/>
              <PoweredByIdeality/>
            </b-modal>
          </template>

          <b-button variant="primary" size="lg"
            v-else
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
            @click="track('cta')"
            v-text="display.CTA"
          />
          <p class="mt-2 lh-sm">
            <small v-if="display.postCTA" v-text="display.postCTA" class="text-muted"/>
          </p>

        </div>
        
      </template>

      <div class="text-end pt-2">
        <small>
          <PoweredByIdeality target="widget">
            <nuxt-link style="color:#BBB" v-if="isAdmin" :to="{name: 'widget-id-config', params: { id: widget.id }}" v-text="'(edit)'"/>
          </PoweredByIdeality>
        </small>
      </div>
    </div>
  </div>
</template>

<script>

  import { assign, get, last, pick} from 'lodash'
  import Bubble from '~/plugins/bubble'
  import { buildPrompt, complete, parseResponse } from '~/plugins/build'
  import { clone, getUser } from '~/plugins/helpers'

  // import { BIconDice5 } from 'bootstrap-vue'

  export default {

    // components: {BIconDice5},
    props: ['widget', 'value', 'duringSetup', 'ai', 'apiKey', 'code', 'go', 'dontFocusOnOutput', 'load', 'omitDescription'],

    data() { 
      let content = this.value || {}
      // console.log(content)
      let { display } = this.widget
      let data = {
        error: null,
        generating: false,
        generated: false,
        usedInput: '',
        usedOutput: '',
        generatedInput: '',
        generatedOutput: '',
        showOutro: true,
        hide: {},
        content,
        display
      }
      return data
    },

    async fetch() {
      if ( this.queryTags.admin ) {
        await getUser(this)
      }
    },

    mounted() {
      this.track('open')
      if (this.queryTags.go || this.go)
        this.$nextTick(this.generate)
    },

    methods: {
      last,

      inspire() {
        return this.generate({})
      },

      tryAgain() {
        let usedContent = { input: this.usedInput, output: this.usedOutput }
        assign(this, { content: usedContent })
        return this.generate(usedContent)
      },

      async generate(content) {

        this.generating = true
        this.error = null
        this.hide.error = false

        try {
          this.track('run')
          let { id, setup, slate, tie } = this.widget
          let { duringSetup } = this
          let { ai } = this
          let { engine, temperature } = ai || {}
          let { apiKey } = {...slate, ...ai, ...this}
          
          let { code } = this.$route.query

          if ( !content ) (
            { content } = this 
          )
          let { input, output } = content
          this.usedInput = input
          this.usedOutput = output

          const append = what => last(what) == '-'
          const cut = what => what.slice(0, -1)
          
          const appendInput = append(input) || undefined

          if ( appendInput )
            input = cut(input)

          output = (
            !appendInput && append(output)
          ) ? cut(output) : undefined
          
          let body = { 
              input, output, appendInput, duringSetup, widget: {id, setup, slate, tie }, 
              apiKey, code, ...this.queryTags
            }
          
          console.log({setup, slate, apiKey})

          let runsLeft

          if ( setup && slate && apiKey ) {
            console.log({ input, output })
            console.log({ setup, slate, tie, duringSetup, input, output, appendInput })
            let { prompt, stop, prefix } = buildPrompt({ setup, slate, tie, duringSetup, input, output, appendInput })
            console.log({ prompt })
            let response = await complete({ prompt, engine, temperature, stop, apiKey, logprobs: this.queryTags.testing && 5 })
            console.log({ response })
            content = parseResponse({ input, output, appendInput, prefix, response })
            console.log({ content })
          } else
            ( { data: { content, runsLeft }} = await this.$axios.post('api/widget/generate', body) )

          assign(this, { content })
          // console.log(runsLeft)
          if ( runsLeft && this.code)
            this.$set(this.code, 'runsLeft', runsLeft.code)
          
          this.generated = true
          this.generatedInput = this.content.input
          this.generatedOutput = this.content.output
          this.$emit('generated')
          if ( content.output && !this.dontFocusOnOutput)
            this.focus(this.widget.slug+'-widget-output')
        } catch(e) {
          console.log(e)
          let error = get(e, 'response.data.error')
          if ( error )
            assign(this, {error})
        } finally {
          this.generating = false
        }

      },

      track(action) {
        let { widget } = this
        this.$axios.post('api/widget/track', {
          action,
          widget
        })
      }

    },

    computed: {
      get,
      isRetry() {
        return this.generated && this.content.output &&
          this.generatedInput == this.content.input &&
          this.generatedOutput == this.content.output        
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
