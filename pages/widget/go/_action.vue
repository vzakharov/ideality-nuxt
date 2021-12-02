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
    name: "Thread intros",
    display: {
      description: "Want to tweet a thread but don’t know where to start? Just paste your bio and see what happens!",
      inputCaption: "Your Twitter bio",
      inputPlaceholder: "E.g. “My life is a story. I tweet about my day-to-day, share insights about the world I'm living in, and sometimes make you feel better.”",
      outputCaption: "Here’s how you can start that thread 🧵",
      preCTA: "Looks good?",
      CTA: "Start that thread!",
      CTAContent: "https://twitter.com/intent/tweet?text=<output>"
    },
    setup: {
      parameterValues: {
        'Suggest...': "Twitter thread intro",
        'Based on...': "user bio",
        Context: "Twitter threads are groups of tweets sent together at the same time by the same person and following a single story."
      },
      examples: [
        {
          input: "@amazing_gems: Shipping amazing handmade jewelry from all over the world so you can feel at home wherever you are. 💎",
          output: "True beauty is found in the details, and that’s certainly true for jewelry. In this thread, we’ll show you some behind-the-scenes of our work Amazing Gems. 💎💎💎"
        },
        {
          input: "@AaronWrites: Freelance writer focusing on tech and a lifelong learner. ✒ Follow me for copywriting tips and more fun with words.",
          output: "The way you talk about your product is often just as important to a customer’s purchase decision as the quality of the product itself. Here are some tips to keep your copy short, snappy, and on-brand. 💡"
        },
        {
          input: "@MomOfFourMonsters: Stay-at-home mom with four kids. #family #happymom #dontworrybehappy",
          output: "Keeping your kids occupied during the day can be tricky 😜, but I’ve got some ideas for you. Here are some of our family’s favorite activities to keep them busy from morning to evening."
        },
        {
          input: "@JeffJenkins: I'm a director with no formal training and a love for storytelling.",
          output: "In the past, filmmakers were closely tied to formal education and training. But technology has made the craft much more accessible to anyone. Here’s what that means for the future of filmmaking: (1/10)"
        },
        {
          input: "@SydneyPinder: The Australian behind your favourite Instagram filters.",
          output: "Instagram is a visual platform and one of our favorite ways to share moments with friends and followers. Here I’ll give you some insights into what goes into making an Instagram profile that really stands out."
        }
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
        this.pseudoRoute({ query: { code }})
      },

      async getShortlink({ shortlink, url } = this) {
        if ( shortlink )
          return shortlink
        let { tail } = await Bubble.anon.go('shortlink', { url })
        return this.shortlink = `${this.baseUrl}to/${tail}`
      }
      
    }

  }

</script>

<style>

</style>