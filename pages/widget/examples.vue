<template>
  <b-container fluid="md" class="mt-3 mb-5" style="max-width: 960px">
    <b-row>
      <b-col sm="4" lg="3" class="d-none d-sm-block">
        <b-list-group>
          <b-list-group-item button v-for="w in widgets" :key="w._id" :active="w==widget" @click="setWidget(w)">
            {{ w.display.name }}
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col xs="12" sm="8" lg="9" class="bg-white">
        <b-dropdown class="d-sm-none" variant="outline-primary" :text="widget ? widget.display.name : 'Pick a widget'">
          <b-dropdown-item v-for="w in widgets" :key="w._id" :active="w==widget" @click="setWidget(w)">
            {{ w.display.name }}
          </b-dropdown-item>
        </b-dropdown>
        <div v-if="widget">
          <template v-if="!godMode">
            <template v-if="$route.query.code && !code">
              Checking your promo code, please wait...
            </template>
            <template v-else-if="code && !apiKey">
              <b>Widget runs remaining</b>
              <b-progress :value="code.runsLeft" :max="code.runsMax" show-value
                :variant="(2 * code.runsLeft > code.runsMax) ? 'primary' : (4 * code.runsLeft > code.runsMax) ? 'warning' : 'danger'"
              />
              <b-button size="sm" variant="outline-secondary" class="mt-2" v-text="'Use your own API key'"
                @click="code=undefined"
              />
            </template>
            <template v-else>
              <h3>Before we begin</h3>
              <div class="mt-2" style="cursor: pointer" @click="hideApiKey=!hideApiKey">
                <b>API key </b> <small><i v-text="hideApiKey ? '(show)' : '(hide)'"/></small>
              </div>
              <template v-if="!hideApiKey">
                <b-input
                  description="While the app is still in beta, we cannot use our own API key for public purposes.
                    We don’t store your API key and just use it once when sending the request to OpenAI servers."
                  placeholder="sk-..."
                  id="apiKey"
                  ref="apiKey"
                />
                <p
                  @click="showApiKeyExplanation=!showApiKeyExplanation"
                ><small class="form-text text-muted" style="text-decoration: underline dotted; cursor: pointer">
                  Why do we need this? Is it safe?
                </small></p>
                <p v-if="showApiKeyExplanation"><small class="form-text text-muted">
                  While the app is still in beta, we cannot use our own API key for public purposes, so you
                  use your own API key. One generation will cost approximately $0.003 (~500 Curie tokens).
                  <b>We don’t store your API key and only use it ephemerally to send requests to OpenAI servers.</b>
                </small></p>
                <p>Don’t have an API key but still want to try? <a href="#beta">Request</a> beta access.</p>
              </template>
            </template>
          </template>
          <!-- <h3 v-text="widget.display.name"/>
          <small>Here’s how your widget might look like (shadow not included):</small> -->
          <WidgetProper ref="widget" :key="widget.id" class="border p-4 mt-4 mb-4"
            v-bind="{widget, apiKey, code}"
          />
          <template v-if="hasQueryTag('dev')">
            <LabeledInput
              caption="Embed link"
              :value="iframeCode"
              :multiline="true"
              :props="{
                style: 'font-family: monospace',
                disabled: true,
                rows: 1
              }"
            />
            <b-button :variant="copied ? 'light' : 'outline-secondary'" size="sm" v-text="!copied ? 'Copy' : 'Copied!'"
              @click="$copyText(iframeCode).then(() => copied=true)"
            />
            <LabeledInput
              caption="Use with your own API key"
              v-model="widget.apiKey"
              :props="{
                placeholder: 'sk-...'
              }"
            />
          </template>
          <div v-else>
            <h3>Get the widget</h3>
            <p>If you’d like to get this or any other widget, request beta access below:</p>
            <ObjectConfig
              v-model="betaRequest"
              :fields="{
                email: { caption: 'Email', placeholder: 'bill@microsoft.com', props: {id: 'beta'}},
                bio: { caption: 'Bio', placeholder: 'Anything you want to tell about yourself and/or why you want this widget. Can be as short as your Twitter handle.', multiline: true}
              }"
            />
            <b-button class="mt-2" variant="success" :disabled='!(betaRequest.email && betaRequest.bio)'>
              Request beta access
            </b-button>
          </div>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  import Vue from 'vue'
  import VueClipboard from 'vue-clipboard2'
  Vue.use(VueClipboard)

  import { assign, find } from 'lodash'

  export default {

    data() { return {
      widget: null,
      copied: false,
      apiKey: null,
      hideApiKey: false,
      code: undefined,
      betaRequest: {},
      showApiKeyExplanation: false
    }},

    asyncData: Bubble.load('widgets', { isSample: true }, {sortBy: 'sortIndex'}),

    async mounted() {
      this.widget = find(this.widgets, {slug: this.$route.hash.slice(1)}) || this.widgets[0]
      let codeId = this.$route.query.code
      if ( codeId ) {
        console.log(codeId)
        this.code = await Bubble.anon.get('code', codeId)
        console.log(this.code)
      }
    },

    computed: {
      iframeCode() {
        return `https://ideality.app/widget/${this.widget.slug}`
      }
    },
    
    watch: {
      widget(widget) {
        this.copied = false
      }
    },

    methods: {
      setWidget(widget) {
        Object.assign(this, { widget })
        window.location.hash = '#' + widget.slug
        // this.$nextTick(function() { 
        //   document.getElementById('user-input')
        // })
      }
    }

  }

</script>

<style>

</style>