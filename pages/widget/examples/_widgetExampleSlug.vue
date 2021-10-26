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
          <h1 class="display-4" v-text="widget.display.name"/>
          <p class="lead mx-2">an example Ideality 🔺 widget</p>
          <template v-if="widget.display.sampleDescription">
            <h3>
              Widget info
              <small class="text-muted pointer" 
                v-text="hideWidgetInfo ? '⊞' : '⊟'"
                @click="hideWidgetInfo=!hideWidgetInfo"
              />
            </h3>
            <div v-show="!hideWidgetInfo" v-html="$md.render(widget.display.sampleDescription)"/>
          </template>
          <h3>Widget demo</h3>
          <p>Here’s how your widget might look like in your app (you can customize the CSS and copy as you wish):</p>
          <WidgetProper ref="widget" :key="widget.id" class="border p-3 mt-3 mx-4 mb-4"
            v-bind="{widget, apiKey, code}"
          >
            <b-alert v-if="!$route.query.code && !canRunWidget || (apiKey && !hideApiKey)" :show="true" variant="warning" class="p-2 m-2 mb-0" style="cursor: pointer">
              <p>
                Please enter your <a href="https://beta.openai.com/account/api-keys" target="_blank">OpenAI API key</a> 
                to use the widget.
                <span style="text-decoration: underline dotted; cursor: pointer" @click="showApiKeyExplanation=!showApiKeyExplanation">
                  Why? Is it costly? Is it safe? 
                </span>
              </p>
              <p v-if="showApiKeyExplanation" class="mx-2 text-muted"><small>
                While the app is still in beta, we cannot use our own API key for public purposes, but you
                can use your own API key. One generation will cost approximately $0.003 
                (~500 <a href="https://beta.openai.com/docs/engines/curie" target="_blank">Curie</a> tokens).<br/>
                <b>We don’t store your API key and only use it ephemerally to send requests to OpenAI servers.</b>
              </small></p>
              <b-input
                description="While the app is still in beta, we cannot use our own API key for public purposes.
                  We don’t store your API key and just use it once when sending the request to OpenAI servers."
                placeholder="sk-..."
                id="apiKey"
                ref="apiKey"
                v-model="apiKey"
              />
              <LabeledInput type="boolean" caption="Store locally" 
                :description="!apiKey ? '' : storeApiKeyLocally ? 
                  'Now stored. Local storage only, so that you don’t have to retype it after page refresh.' : 
                  'Now not stored. If it was stored previously, it has been deleted.'"
                v-model="storeApiKeyLocally"
                :disabled="!apiKey"
              />
              <p>Don’t have an API key but still want to try? <a href="#beta">Request</a> beta access.</p>
              <div v-if="apiKey" class="d-flex flex-row-reverse">
                <small @click="hideApiKey=true" class="text-muted align-right" style="cursor:pointer">Close this box</small>
              </div>
            </b-alert>
            <div class="mt-2">
              <small v-if="apiKey && hideApiKey" class="text-muted">
                Using your API key, {{ apiKey.slice(0,10) }}…
                <a href="#apiKey" @click="hideApiKey=false" class="pointer">(Change)</a>
              </small>
            </div>
          </WidgetProper>
          <div v-if="$route.query.code || code" class="d-flex flex-row-reverse px-4">
            <div v-if="$route.query.code && !code">
              Checking your promo code, please wait...
            </div>
            <b-alert v-else-if="code" show class="mb-3 mw-25 fs-sm" 
              :variant="(2 * code.runsLeft > code.runsMax) ? 'info' : (4 * code.runsLeft > code.runsMax) ? 'warning' : 'danger'"
              style="color: gray; font-size: smaller"
            >
              <div>
                <b>Widget runs remaining</b>
                <b-progress :value="code.runsLeft" :max="code.runsMax" show-value
                  style="max-width: 150px"
                />
                <b-button size="sm" variant="outline-secondary" class="mt-2"
                  to="examples" @click="code=undefined"
                >
                  Use your own API key
                </b-button>
              </div>
            </b-alert>
          </div>

          <h3>Customization</h3>
          <p>
            All Ideality 🔺 widgets are based on customizable templates, which allow changing both the display (changing texts,
            adding custom CSS), calls to action and the AI logic.
          </p>

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
            <em v-if="betaRequested">
              We’ve got your beta request and are working on it!
            </em>
            <template v-else>
              <p>If you’d like to get this or any other widget, request beta access below:</p>
              <ObjectConfig
                v-model="betaRequest"
                :fields="{
                  email: { caption: 'Email', type: 'email', placeholder: 'gdb@openai.com', id: 'beta'},
                  bio: { caption: 'Bio', placeholder: 'Anything you want to tell about yourself and/or why you want this widget. Can be as short as your Twitter handle.', multiline: true}
                }"
              />
              <b-button class="mt-2" variant="success" :disabled='!(betaRequest.email && betaRequest.bio)'
                @click="requestBeta"
              >
                Request beta access
              </b-button>
            </template>
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

  import { assign, find, get } from 'lodash'

  export default {

    head() { return {
      title: `${get(this, 'widget.display.name')} ▲ an example Ideality 🔺 widget`,
      meta: [{
        hid: 'description',
        name: 'description',
        content: get(this, 'widget.display.sampleDescription')
      }]
    }},

    data() { return {
      betaRequested: false,
      widget: null,
      copied: false,
      apiKey: null,
      hideApiKey: false,
      hideWidgetInfo: false,
      code: undefined,
      betaRequest: {},
      showApiKeyExplanation: false,
      storeApiKeyLocally: false
    }},

    asyncData: Bubble.load('widgets', { isSample: true }, {sortBy: 'sortIndex'}),

    async mounted() {
      let localApiKey = localStorage.getItem('apiKey')
      if (localApiKey) {
        assign(this, {
          storeApiKeyLocally: true,
          apiKey: localApiKey
        })
      }
      assign(this, { betaRequested: localStorage.getItem('betaRequested') })
      this.widget = find(this.widgets, {slug: this.$route.params.widgetExampleSlug})
      if ( !this.widget ) {
        this.setWidget(this.widgets[0])
        return
      }
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

      storeApiKeyLocally(yes) {
        if ( yes )
          localStorage.setItem('apiKey', this.apiKey)
        else
          localStorage.removeItem('apiKey')
      },

      widget(widget) {
        // let apiKey = get(widget, 'template.apiKey')
        // if ( apiKey )
        //   assign(this, { apiKey })
        this.copied = false
      }

    },

    methods: {

      requestBeta() {
        Bubble.anon.go('requestBeta', this.betaRequest)
        this.betaRequested = true
        localStorage.setItem('betaRequested', true)
      },
      
      setWidget(widget) {
        Object.assign(this, { widget })
        history.pushState(null, null,
          this.$router.resolve({...this.$route, name: 'widget-examples-widgetExampleSlug', params: { widgetExampleSlug: widget.slug}}).href
        )
        // window.location.hash = '#' + widget.slug
        // this.$nextTick(function() { 
        //   document.getElementById('user-input')
        // })
      }

    }

  }

</script>

<style>
a {
  text-decoration: none;
}
.pointer {
  cursor: pointer;
}
</style>