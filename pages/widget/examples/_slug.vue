<template>
  <b-container fluid="md" class="mt-3 mb-5" style="max-width: 920px">
    <b-row>
      <Breadcrumbs/>
    </b-row>
    <b-row>
      <b-col class="bg-white">
        <b-tabs pills>
          <b-tab size="sm" v-for="w in widgets" :key="w._id" :active="w==widget" @click="setWidget(w)" :title="w.name"/>
        </b-tabs>
        <div v-if="widget" class="px-3">
          <h1 class="display-4" v-text="widget.name"/>

          <b-button variant="outline-secondary" size="sm" class="mb-4"
            @click="invert('hide.allButWidget'); window.history.pushState(0,0,$router.resolve({...$route, query:{...$route.query, noinfo: hide.allButWidget ? null : undefined}}).href)"
            v-text="hide.allButWidget ? 'About the widget' : 'Hide all but the widget'"
          />

          <template v-if="!hide.allButWidget">
            <template v-if="widget.display.sampleDescription">
              <Heading id="info">
                Widget info
              </Heading>
              <div v-html="$md.render(widget.display.sampleDescription)"/>
            </template>
            <Heading id="demo">Widget demo</Heading>
            <p>Here’s how your widget might look like in your app (you can customize the CSS and copy as you wish):</p>
          </template>

          <WidgetBox>
            <WidgetProper ref="widget" :key="widget.id" :omitDescription="true"
              v-bind="{widget, apiKey, code, go}"
              :value="content"
            >
            <b-alert v-if="!codeId && !canRunWidget || (apiKey && !hideApiKey)" :show="true" variant="warning" class="p-2 m-2 mb-0" style="cursor: pointer">
              <p>
                Enter your <a href="https://beta.openai.com/account/api-keys" target="_blank">OpenAI API key</a> 
                to use the widget.
                <a href="#" @click.prevent="showApiKeyExplanation=!showApiKeyExplanation">
                  Why?
                </a>
              </p>
              <p v-if="showApiKeyExplanation" class="mx-2 text-muted"><small>
                While the app is still in beta, we cannot use our own API key for public purposes, but you
                can use yours. One generation costs ~$0.003 
                (~500 <a href="https://beta.openai.com/docs/engines/curie" target="_blank">Curie</a> tokens).
                <b>We don’t store your API key and only use it ephemerally to send requests to OpenAI.</b>
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
          </WidgetBox>
          <div v-if="codeId || code" class="d-flex flex-row-reverse px-4">
            <b-alert show class="mb-3 mw-25 fs-sm" 
              :variant="(!code || 2 * code.runsLeft > code.runsMax) ? 'info' : (4 * code.runsLeft > code.runsMax) ? 'warning' : 'danger'"
              style="color: gray; font-size: smaller"
            >
              <div v-if="codeId && !code">
                Checking your promo code, please wait...
              </div>
              <div v-else>
                <b>Widget runs remaining</b>
                <b-progress :value="code.runsLeft" :max="code.runsMax" show-value
                  style="max-width: 150px"
                />
                <b-button size="sm" variant="outline-secondary" class="mt-2"
                  @click.prevent="code=undefined; codeId=undefined; $nextTick(()=>window.document.getElementById('apiKey').focus())"
                >
                  Use your own API key
                </b-button>
              </div>
            </b-alert>
          </div>

          <template v-if="!hide.allButWidget">
            <Heading>Customization</Heading>
            <p>
              All Ideality widgets are based on customizable templates, which allow changing both the display (changing texts,
              adding custom CSS), calls to action and the AI logic.
              Here is an <a href="https://gyazo.com/4bad7e812a8c3697cf95ef3e70e2bff4" target="_blank">example screencast</a>.
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
          </template>

          <Heading id="access">Get the widget</Heading>
          <TextAccess/>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  import Vue from 'vue'
  // import VueClipboard from 'vue-clipboard2'
  // Vue.use(VueClipboard)

  import { assign, find, get } from 'lodash'

  export default {

    head() { return {
      title: `${get(this, 'widget.name')} 🔺 Ideality widget example`,
      meta: [{
        hid: 'description',
        name: 'description',
        content: get(this, 'widget.display.sampleDescription')
      }]
    }},

    data() { 
      let { input, output } = this.$route.query
      let content = { input, output }
      
      return {
        betaRequested: false,
        // widget: null,
        copied: false,
        apiKey: undefined,
        hide: {
          allButWidget: typeof this.$route.query.noinfo !== 'undefined'
        },
        hideApiKey: false,
        hideWidgetInfo: false,
        go: typeof this.$route.query.go !== 'undefined',
        codeId: this.$route.query.code,
        code: undefined,
        betaRequest: {},
        content,
        showApiKeyExplanation: false,
        storeApiKeyLocally: false
      }
    },

    async asyncData({params, query}) {
      let data = {}
      assign(data, await Bubble.asyncData('widgets', { isExample: true }, {sortBy: 'sortIndex'})(...arguments))

      data.widget = find(data.widgets, {slug: params.slug})
      if ( !data.widget ) {
        data.widget = data.widgets[0]
      }
      return data
    },

    async mounted() {
      let localApiKey = localStorage.getItem('apiKey')
      if (localApiKey) {
        assign(this, {
          storeApiKeyLocally: true,
          apiKey: localApiKey
        })
      }
      assign(this, { betaRequested: localStorage.getItem('betaRequested') })

      let { codeId } = this

      if ( codeId ) {
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
      },

      'window.location.pathname': {
        deep: true
      }

    },

    methods: {

      requestBeta() {
        Bubble.anon.go('requestBeta', {
          ...this.betaRequest,
          hasApiKey: !!this.apiKey
        })
        this.betaRequested = true
        localStorage.setItem('betaRequested', true)
      },
      
      setWidget(widget) {
        Object.assign(this, { widget })
        history.pushState(null, null,
          this.$router.resolve({...this.$route, name: 'widget-examples-slug', params: { slug: widget.slug}}).href
        )
        this.$store.commit('set', { path: window.location.pathname })
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