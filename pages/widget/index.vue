<template>
  <div>
    <NavWidget/>
    <b-container class="mt-5" style="max-width: 800px; margin-bottom: 300px">
      <h1 class="display-1">Ideality Widget 🔺</h1>
      <h2 class="display-6 fw-bold">AI-powered ideas for your users</h2>
      <hr>
      <p>
        Sometimes, people don’t need your product. Other times, they just need a little push.
        <strong>Ideality Widget encourages users to use your product by giving them ideas.</strong>
      </p>

      <Heading>
        Examples
      </Heading>
      <p class="text-end form-text">
        <small>
          (more examples
          <nuxt-link :to="{name: 'widget-examples-slug'}">here</nuxt-link>)
        </small>
      </p>

      <p>
        Let’s say you’re building a tweet scheduling app.
      </p>

      <p>
        Your users want to use it, but <strong>they just don’t know what to tweet</strong>.
      </p>
      <p>
        So you give them this (try with your own bio, it’s fun!):
      </p>

      <WidgetBox>
        <WidgetProper v-if="widgets" :widget="widgets[0]" :go="true" :dontFocusOnOutput="true"/>
        <Loading v-else message="Loading your widget, hold on a sec..."/>
      </WidgetBox>

      <p>
        Or maybe you run an online grocery store? Then you can give your visitors
        a nifty tool that tells them what groceries they need to buy to bake their favorite cake:
      </p>

      <p class="text-muted">
        <small>
          For some extra hilarity, try with some non-food items like “love” or “the meaning of life”
        </small>
      </p>  

      <WidgetBox :value="widgets" :key="widgets">
        <WidgetProper v-if="widgets" :widget="widgets[1]" :go="true" :dontFocusOnOutput="true"/>
        <Loading v-else message="Loading your widget, hold on a sec..."/>
      </WidgetBox>
      
      <p>
        I here you say: “Okay, this is all fun, but...”
      </p>

      <Heading id="your-case">
        Why would <em>I</em> want to use it?
      </Heading>

      <p>
        Let’s see how!
        <strong>Enter a brief description of your product below:</strong>
      </p>

      <WidgetBox>
        <WidgetProper v-if="widgets" :widget="widgets[2]" :go="true" :dontFocusOnOutput="true"/>
        <Loading v-else message="Loading your widget, hold on a sec..."/>
      </WidgetBox>

      <Heading id="setup">
        Is it hard to set up?
      </Heading>

      <p>
        No! Ideality Widget is packed with very simple yet flexible AI logic, so you
        can adapt it to pretty much any product or service.
      </p>

      <p>
        All you have to do fill out a few fields to configure how you want the widget to look,
        what you want it to suggest, and give it a few examples. Just
        <a href="https://gyazo.com/4bad7e812a8c3697cf95ef3e70e2bff4" target="_blank">
          like this.
        </a>
      </p>

      <p>
        After that you can embed it
        (<nuxt-link :to="{ name: 'widget-id-embed', params: {id: 'tweet-ideas'}}">example</nuxt-link>)
        just like you would with any other HTML.

      <Heading id="pricing">How much?</Heading>
      <p>
        As we’re using a super-efficient AI, Ideality Widget is surprisingly affordable.
        In fact, <b>early adopters get 100 generations for free</b>, so you can try it out
        and see if it boosts your conversion rates. After that, the price is as low as
        <b>$6 per 1000 generations</b>.
      </p>

      <Heading id="access">How to get it</Heading>
      <TextAccess/>
<!-- 
      <b-row align-h="center">
        <b-col cols="8">
          <AccessRequest class="border rounded shadow p-2"/>
        </b-col>
      </b-row> -->

    </b-container>
  </div>
</template>

<script>

  import Bubble from '~/plugins/bubble'
  import { omit } from 'lodash'

  export default {

    middleware({ store: { $auth }, redirect }) {
      if ($auth.loggedIn)
        redirect({ name: 'dashboard', hash: '#widgets' })
    },

    data() { 
      return {
        productDescription: '',
        userDefinedDescription: false,
        generated: false,
        widgets: null
      }
    },

    async fetch() {
      let { widgets } = (
        await Bubble.anon.go('getWidgetLandingWidgets')
      )

      // debugger
      
      widgets = widgets.map(widget => omit(widget, 'display.description'))
      Object.assign(this, { widgets })
    },

    computed: {
      productDescriptionInput: () => window.document.getElementById('productDescription')
    },

    mounted() {
      // this.focus('product-description', 'select')
    }

  }

</script>

<style scoped>
  a {
    text-decoration: none;
  }

  p {
    margin-bottom: 25px;
    font-size: 20px;
  }

</style>