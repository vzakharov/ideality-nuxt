<template>
  <b-container fluid="md" class="mt-3" style="max-width: 960px">
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
              <small class="form-text text-muted">
                While the app is still in beta, we cannot use our own API key for public purposes, so you
                use your own API key. One generation will cost approximately $0.003 (~500 Curie tokens).
                <b>We don’t store your API key and only use it ephemerally to send requests to OpenAI servers.</b>
              </small>
            </template>
          </template>
          <!-- <h3 v-text="widget.display.name"/>
          <small>Here’s how your widget might look like (shadow not included):</small> -->
          <WidgetProper ref="widget" v-bind="{widget, apiKey}" :key="widget.id" class="border p-4 mt-4 mb-4"/>
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
            <b-button variant="outline-success" v-text="'Get this widget'"/>
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

  import { find } from 'lodash'

  export default {

    data() { return {
      widget: null,
      copied: false,
      apiKey: null,
      hideApiKey: false
    }},

    asyncData: Bubble.load('widgets', { isSample: true }, {sortBy: 'sortIndex'}),

    mounted() {
      this.widget = find(this.widgets, {slug: this.$route.hash.slice(1)}) || this.widgets[0]
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