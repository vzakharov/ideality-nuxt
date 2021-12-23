<template>
  <b-row>
    <b-row align-h="center" align-v="center">
      <b-col align-self="center" 
        :class="{
            'bg-light': !prop('hideBackground'),
            ['p-' + ( prop('padding') || 2 )]: true ,
            'border shadow': prop('box')
        }"
        :style="prop('box') && 'max-width:600px'"
      >
        <template v-if="!duringSetup">
          <h4 v-if="!prop('hideHeading') && !widget.display.hideTitle" v-text="widget.display.name || widget.name" class="mb-3"/>
          <template v-if="!hideDescription && widget.display.description">
            <p v-if="widget.display.markdownDescription" v-html="$md.render(widget.display.description)"/>
            <p v-else v-text="widget.display.description"/>
          </template>
        </template>
              
        <LabeledInput
          v-if="!prop('hideInput')"
          v-model="content.input"
          v-bind="{
            id: 'widget-input',
            caption: display.inputCaption,
            placeholder: display.inputPlaceholder,
            labelTag: 'h3',
            disabled: generating,
            multiline: true,
            removeNewLines: !multilineInput,
            rows: 1
          }"
          @keydown.native.enter.exact="!multilineInput && generate()"
          @keydown.native.ctrl.enter="generate()"
          @keydown.native.alt.enter="isRetry && tryAgain()"
          @input="changed=true"
          ref="input"
        />

            <div v-if="!generating">
              <b-button :variant="isRetry ? 'outline-primary' : 'primary'" v-text="continueOutput ? 'Continue' : isRetry ? 'Try again' : display.suggestCaption || 'Suggest'" 
                :disabled="!content.input || !canRunWidget"
                @click="isRetry ? tryAgain() : generate()"
              />
              <b-button class="text-muted" variant="light" v-text="'Inspire me!'"
                v-if="!prop('hideInput')"
                @click="inspire"
                :disabled="!canRunWidget"
              />
              <b-button v-if="display.native.componentName && content.output" variant="light" class="text-muted"
                v-text="preview ? 'Edit' : 'Preview'"
                @click.prevent="preview = !preview"
              />
            </div>
            <template v-else>
              <b-spinner class="spinner-grow text-danger"/>
              <small class="text-muted" v-text="[
                'Generating, please wait...',
                'Trying again...',
                'And again...',
                'One last time...'
              ][retry]"/>
            </template>
          <div v-if="!preview && content.output || duringSetup">
            <LabeledInput
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
            <div v-if="content.output && showEditingTip" class="mb-2" style="color:#BBB; font-size: 0.8em">
              Pro tip: Like the beginning of the generation but not the end? Just delete what you don’t need from the end,
              put a dash (-), and click Ctrl/Cmd+Enter — the app will continue writing where you stopped!
            </div>
          </div>

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
                v-b-modal.content-preview
                v-text="display.CTA"
              />
              <b-modal id="content-preview" size="xl" hide-footer :title="`${widget.name} preview`">
                <component :is="'Builder' + widget.display.native.componentName" v-bind="{widget, content}" :key="content.output"/>
                <PoweredByIdeality/>
              </b-modal>
            </template>

            <b-button variant="primary" size="lg"
              v-else
              :href="
                display.CTAType=='link' || !display.CTAType ?
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

        <div class="text-end pt-2" v-if="!prop('hidePoweredBy')">
          <small>
            <PoweredByIdeality target="widget">
              <nuxt-link style="color:#BBB" v-if="isAdmin" :to="{name: 'widget-id-config', params: { id: widget.slug }}" v-text="'(edit)'"/>
            </PoweredByIdeality>
          </small>
        </div>
      </b-col>
      <b-col cols="12" lg="9" v-if="content.output && preview" class="text-center">
        <b-col>
          <component breakpoints="" class="bg-light shadow rounded px-2 mt-2 py-4" :is="'Builder' + widget.display.native.componentName" v-bind="{widget, content}" :key="content.output"/>
        </b-col>
      </b-col>
    </b-row>
  </b-row>
</template>

<script>

  import { assign, get, last, map, pick} from 'lodash'
  import Bubble from '~/plugins/bubble'
  import { buildPrompt, complete, parseResponse } from '~/plugins/build'
  import { clone, getUser } from '~/plugins/helpers'

  // import { BIconDice5 } from 'bootstrap-vue'

  export default {

    // components: {BIconDice5},
    props: ['widget', 'value', 'duringSetup', 'exampleIndex', 'ai', 'apiKey', 'code', 'go', 
      'dontFocusOnOutput', 'load', 'box',
      'hideDescription', 'hideBackground', 'hideHeading', 'hideInput', 'hidePoweredBy', 'padding',
      'showEditingTip'],

    data() { 
      let content = this.value || {}
      // console.log(content)
      let { display } = this.widget
      display.native = display.native || {}
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
        display,
        preview: display.native.straightToPreview,
        retry: 0
      }
      return data
    },

    async fetch() {
      if ( this.queryTags.admin ) {
        if ( !await getUser(this) ) {
          this.$router.push({name: 'login', query: { then: this.$route.fullPath }})
        } 
      }
    },

    mounted() {
      this.track('open')
      if (this.queryTags.go || this.go)
        this.$nextTick(this.generate)
    },

    methods: {
      get, last,

      inspire() {
        return this.generate({})
      },

      tryAgain() {
        let content = { input: this.usedInput || this.content.input, output: this.usedOutput }
        console.log({content})
        assign(this, { content })
        return this.generate(content)
      },

      async generate(content) {

        this.generating = true
        this.error = null
        this.hide.error = false

        try {
          this.track('run')
          let { id, setup, slate, tie } = this.widget
          let { duringSetup, exampleIndex } = this
          let { ai } = this
          // let { engine, temperature } = ai || {}
          let { apiKey, engine, temperature } = {...slate, ...ai, ...this, ...this.$route.query} || {}
          
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
              input, output, appendInput, duringSetup, exampleIndex, widget: {id, setup, slate, tie }, 
              apiKey, code, ...this.queryTags
            }
          
          console.log({setup, slate, apiKey})

          let runsLeft
          
          let go = async () => {
            
            if ( setup && slate && apiKey ) {
              // console.log({ input, output })
              // console.log({ setup, slate, tie, duringSetup, exampleIndex, input, output, appendInput })
              let { prompt, stop, prefix } = buildPrompt({ setup, slate, tie, duringSetup, exampleIndex, input, output, appendInput })
              console.log({ prompt })
              let response = await complete({ prompt, engine, temperature, stop, apiKey, logprobs: this.queryTags.testing && 5 })
              // console.log({ response })
              content = parseResponse({ input, output, appendInput, prefix, response })
              console.log({ content })
            } else
              ( { data: { content, runsLeft }} = await this.$axios.post('api/widget/generate', body) )

            let match = !setup.validationRegex || content.output.match(new RegExp(`^${setup.validationRegex}$`))

            let { retry } = this
            console.log({retry})
            if ( !match && retry < 4 ) {
              this.retry = retry + 1
              return go()
            }

          }

          await go()

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
          this.retry = 0
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
      continueOutput() {
        return this.content.output && this.content.output.slice(-1) == '-'
      },

      isRetry() {
        return this.generated && this.content.output &&
          !this.continueOutput
          && this.generatedInput == this.content.input 
          // && this.generatedOutput == this.content.output        
      },

      multilineInput() {
        return get(this.widget, 'slate.multilineInput')
      }

    },

    watch: {
      content: {
        deep: true, 
        handler () { if ( this.content.input || this.content.output ) this.$emit('input', this.content )}
      }
    }

  }

</script>

<style>
.btn {
  margin-right: 10px;
}
</style>
