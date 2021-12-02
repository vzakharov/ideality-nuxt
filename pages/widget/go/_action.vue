<template>
  <b-container>
    <b-row align-h="center">
      <WidgetConfig v-if="!$route.params.action" :value="widget" v-bind="{href, saver}" :ephemeral="true" class="mt-5">
        <div class="text-end">
          <small>
            <Copiable :fetch="getShortlink" class="gray">
              Copy short link
            </Copiable>
          </small>
        </div>
      </WidgetConfig>
      <template v-else>
        <WidgetBox class="mt-5">
          <WidgetProper v-bind="{widget}"/>
          <div class="text-end">
            <small>
              <nuxt-link :to="appendRoute({params: { action: undefined }})" class="gray">
                Edit this widget
              </nuxt-link>
            </small>
          </div>
        </WidgetBox>
        <b-col class="text-center mt-5" style="max-width:600px">
          <h2 class="mb-3 display-6">Make your own AI widget!</h2>
          <div class="lead">
            <p>This is an ephemeral widget, meaning that <strong>its whole configuration is stored in the URL</strong>.
              Feel free to
              <strong><nuxt-link :to="appendRoute({params: { action: undefined }})">
                tinker with it, or even create a new one
              </nuxt-link></strong>, and later share it with others!
            </p>
            <p>
              <strong>It’s free — and no sign up required!</strong>
            </p>
            <p>
              <strong>
                Yours,
                <nuxt-link to="/">
                  Ideality 🔺
                </nuxt-link>
              </strong>
            </p>
          </div>
        </b-col>
      </template>
    </b-row>
  </b-container>
</template>

<script>

  const defaultSlate = {
      instruction: "Suggest <Suggest...> based on <Based on...>.",
      parameters: [
        {
          type: "text",
          name: "Suggest...",
          useAs: "output",
          placeholder: "What do you want the widget to suggest"
        },
        {
          type: "text",
          name: "Based on...",
          useAs: "input",
          placeholder: "What you want the user to enter as the input"
        },
        {
          type: "text",
          name: "Context",
          recital: true,
          multiline: true,
          placeholder: "Any other context that might be important"
        }
      ]
    }
  
  const defaultWidget = {
    name: "",
    display: {
    },
    setup: {
      parameterValues: {
        'Suggest...': "",
        'Based on...': "",
        Context: ""
      },
      examples: [
      ]
    }
  }
  
  import JSONCrush from '~/plugins/jsoncrush'
  import jsyaml from 'js-yaml'
  import Bubble from '~/plugins/bubble'

  export default {

    head() { return this.widgetHeader },

    data() {
      let code = this.$route.query['code']
      let yaml = code ? JSON.parse(JSONCrush.uncrush(code)) : jsyaml.dump(defaultWidget)
      return {
        yaml, code, shortlink: null
      }
    },

    computed: {

      baseUrl() {
        return this.$axios.defaults.baseURL
      },

      href() {
        return this.shortlink || this.baseUrl + this.url          
      },

      url({ code } = this) {
        return this.appendedUrl({ query: { code }, params: { action: 'view' }, reset: { query: true }}).slice(1)
      },

      widget() {
        let widget = jsyaml.load(this.yaml)
        if ( !widget.slate ) {
          widget.slate = defaultSlate
        }
        return widget
      }
      
    },

    methods: {

      async saver(widget) {
        let { name, setup, display } = widget
        let cutWidget = { name, setup, display }
        let yaml = jsyaml.dump(cutWidget)
        let code = JSONCrush.crush(JSON.stringify(yaml))
        Object.assign(this, { code, yaml })
        await this.getShortlink()
        this.pseudoRoute(this.shortlink)
      },

      async getShortlink({ shortlink, url } = this) {
        // if ( shortlink )
        //   return shortlink
        let { tail } = await Bubble.anon.go('shortlink', { url })
        return this.shortlink = `${this.baseUrl}to/${tail}`
      }
      
    }

  }

</script>

<style>

</style>