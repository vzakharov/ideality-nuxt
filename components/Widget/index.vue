<template>
  <b-row align-h="center">
    <b-row align-h="center" align-v="center" class="gx-5">
      <b-col align-self="center"
        :class="{
            'bg-light': !prop('hideBackground'),
            ['p-' + ( prop('padding') || 2 )]: true,
            'border shadow': prop('box')
        }"
        :style="(!content.output || !preview ) && 'max-width:600px'"
      >
        <template v-if="!duringSetup">
          <h4 v-if="!prop('hideHeading') && !widget.display.hideTitle" v-text="widget.display.name || widget.name" class="mb-3"/>
          <template v-if="widget.display.description && !hideDescription && !( hideDescriptionIfOutput && content.output )">
            <p v-if="widget.display.markdownDescription" v-html="$md.render(widget.display.description)"/>
            <p v-else v-text="widget.display.description"/>
          </template>
        </template>
              
        <MyInput
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
              :disabled="!content.input"
              @click="isRetry ? tryAgain() : generate()"
            />
            <b-button class="text-muted" variant="light" v-text="'Inspire me!'"
              v-if="!prop('hideInput')"
              @click="inspire"
            />
            <b-button v-if="display.native.componentName && content.output" variant="light" class="text-muted d-lg-none"
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
          <div v-if="content.output || duringSetup" :class="preview && 'd-none d-lg-block'">
            <MyInput
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
                <component :is="'Block' + widget.display.native.componentName" v-bind="{widget, content}" :key="content.output"/>
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
        <slot/>      
      </b-col>
      <b-col cols="12" lg="8" v-if="content.output && preview && !duringSetup" class="text-center">
        <b-col>
          <component @contentParsed="$emit('contentParsed', $event)" breakpoints="" class="bg-light shadow rounded px-2 mt-2 py-4" :is="'Block' + widget.display.native.componentName" v-bind="{widget, content}"/>
        </b-col>
      </b-col>
    </b-row>
  </b-row>
</template>

<script>

  import { assign, get, last} from 'lodash'
  import { buildPrompt, complete, parseResponse } from '~/plugins/whispering'
  import { getUser } from '~/plugins/helpers'

  // import { BIconDice5 } from 'bootstrap-vue'

  export default {

    // components: {BIconDice5},
    props: ['widget', 'value', 'duringSetup', 'exampleIndex', 'ai', 'apiKey', 'code', 'go', 
      'dontFocusOnOutput', 'load', 'box',
      'hideDescription', 'hideDescriptionIfOutput', 'hideBackground', 'hideHeading', 'hideInput', 'hidePoweredBy', 'padding',
      'showEditingTip'],

    data() { 
      // console.log(content)
      let { display } = this.widget
      display.native = display.native || {}
      let data = {
        content: null,
        error: null,
        generating: false,
        generated: false,
        usedInput: '',
        usedOutput: '',
        generatedInput: '',
        generatedOutput: '',
        showOutro: true,
        hide: {},
        display,
        preview: display.native.straightToPreview,
        retry: 0
      }
      return data
    },

    async fetch() {
      if ( this.queryFlags.admin ) {
        if ( !await getUser(this) ) {
          this.$router.push({name: 'login', query: { then: this.$route.fullPath }})
        } 
      }
    },

    mounted() {
      this.track('open')
      if (this.queryFlags.go || this.go)
        this.$nextTick(this.generate)
    },

    methods: {
      get, last,

      inspire() {
        return this.generate({})
      },

      tryAgain() {
        let content = { input: this.usedInput || this.content.input, output: this.usedOutput }
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
              apiKey, code, ...this.queryFlags
            }
          
          let runsLeft
          
          let go = async () => {
            
            if ( setup && slate && apiKey ) {
              let { prompt, stop, prefix } = buildPrompt({ setup, slate, tie, duringSetup, exampleIndex, input, output, appendInput })
              let response = await complete({ prompt, engine, temperature, stop, apiKey, logprobs: this.queryFlags.testing && 5 })
              content = parseResponse({ input, output, appendInput, prefix, response })
            } else
              ( { data: { content, runsLeft }} = await this.$axios.post('api/widget/generate', body) )

            let match = !setup.validationRegex
            
            if ( !match ) {
              match = content.output.match(new RegExp(`${setup.validationRegex}`))
              if ( match ) {
                content.output = match[0]
              }
            }

            let { retry } = this
            // console.log({retry})
            if ( !match  ) {
              if ( retry < 3 ) {
                this.retry = retry + 1
                return go()
              } else {
                error = {
                  cause: 'nonmatch',
                  message: "Sorry, the output did not match the expected format. Please try again or report the problem to the developer."
                }
              }
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
        handler(content) { 
          if ( this.ignoreContentChange )
            return this.ignoreContentChange = false
          if ( content.input || content.output ) this.$emit('input', content )
        }
      },

      value: {
        immediate: true,
        handler(value) {
          this.ignoreContentChange = true
          this.content = value || {}
          // console.log(this, {value})
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
