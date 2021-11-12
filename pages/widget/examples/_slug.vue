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

          <div v-if="widget.display.sampleDescription" v-html="$md.render(widget.display.sampleDescription)"/>

          <WidgetBox>
            <WidgetProper ref="widget" :key="widget.id" :omitDescription="true"
              v-bind="{widget, apiKey, code, go}"
              :value="content"
            />
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