<template>
  <div>
    <b-container class="p-3" style="max-width: 960px">
      <b-row>
        <b-col cols="4" style="max-width:300px" class="p-2 mx-4">
          <b-list-group>
            <b-list-group-item button v-for="w in widgets" :key="w._id" :active="w==widget" @click="setWidget(w)" v-text="w.display.name"/>
          </b-list-group>
        </b-col>
        <b-col cols="7" class="bg-white p-2">
          <div v-if="widget">
            <!-- <h3 v-text="widget.display.name"/>
            <small>Here’s how your widget might look like (shadow not included):</small> -->
            <WidgetProper ref="widget" v-bind="{widget}" :key="widget._id" class="shadow mt-2 mb-4"/>
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
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  import Vue from 'vue'
  import VueClipboard from 'vue-clipboard2'
  Vue.use(VueClipboard)

  export default {

    data() { return {
      widget: null,
      copied: false
    }},

    asyncData: Bubble.load('widgets', { isSample: true }),

    mounted() {
      this.widget = this.widgets[0]
    },

    computed: {
      iframeCode() {
        return `https://ideality.app/widget/${this.widget.slug}`
      }
    },
    
    watch: {
      widget() {
        this.copied = false
      }
    },

    methods: {
      setWidget(widget) {
        Object.assign(this, { widget })
        // this.$nextTick(function() { 
        //   document.getElementById('user-input')
        // })
      }
    }

  }

</script>

<style>

</style>