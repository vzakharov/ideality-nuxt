<template>

  <b-container class="mt-5" style="max-width: 800px; margin-bottom: 300px">
    <Breadcrumbs/>
    <h1 class="display-1">Ideality Widget 🔺</h1>
    <div class="lead">AI-powered ideas for your users</div>
    <hr>
    <p class="fw-bold lh-3" >
      Sometimes, people don’t need your product.<br>
      Other times, they just need is a little push to get started.
    </p>

    <p>
      Ideality Widget does just that: With a single click it can instantly 
      suggest a number of related ideas that fit your users’ bio, goals, 
      or any other input they provide.
    </p>

    <p>
      Ideality Widget goes beyond just suggesting random ideas: 
      It uses a powerful yet affordable AI engine to connect seemingly 
      unrelated concepts and come up with truly innovative ideas that 
      will turn your users‘ heads around.
    </p>

    <Heading>Let’s try!</Heading>

    <p>
      Seeing is believing — let’s try a little experiment. 
      Enter a brief description of your product in the form below:
    </p>

    <LabeledInput 
      caption="Describe your product"
      placeholder="E.g. “an app that...”"
      id="product-description"
      :description="!productDescription ? 'Enter a description to continue' : 'Enter any other description if you wish'"
      v-model="productDescription"
      :fix-after-blur="true"
      :lazy="true"
      @input="userDefinedDescription=true; focus('widget-input', 'select', 'scrollIntoView')"
      @blur="focus('widget-input', 'select', 'scrollIntoView')"
    />
    <!-- <b-button variant="primary"
    >
      Show me the widget!
    </b-button> -->

    <div v-if="productDescription || isTest" class="mt-5">

      <h5>
        <span v-if="userDefinedDescription">Excellent! </span>
        Here’s how a widget for your users might look like. Try it out!
      </h5>
      <div class='form-text text-muted'>
        (Click on 🎲 to generate random user bios.) 
      </div>

      <WidgetProper class="border shadow rounded m-3 my-5 p-3"
        :widget="{
          id: 'demo',
          setup: {
            parameterValues: {
              Product: productDescription
            }
          },
          display: {
            inputCaption: 'User bio',
            inputPlaceholder: 'e.g. “I am a …” or “We are …”',
            outputCaption: 'Suggestions for your user'
          }
        }"
        @generated="generated=true"
        :go="true"
        :dontFocusOnOutput="true"
      />

    </div>

    <div>

      <h5>Impressed?</h5>
      <p>
        The real thing is even better, as you can flexibly customize it to match your 
        specific product and goals. You can watch some of the customized examples
        <nuxt-link to="widget/examples">here</nuxt-link>.
      </p>

      <Heading>How much?</Heading>
      <p>
        As we’re using a super-efficient AI, Ideality Widget is surprisingly affordable.
        In fact, <b>early adopters get 1000 generations for free</b>, so you can try it out
        and see if it boosts your conversion rates. After that, the price is as low as
        <b>$6 per 1000 generations</b>.
      </p>

      <Heading>How to get it</Heading>
      <p>
        Ideality Widget is currently in private beta. If you want to get your hands on it,
        fill out the form below, and we’ll see what we can do!
      </p>

      <b-row align-h="center">
        <b-col cols="8">
          <AccessRequest class="border rounded shadow p-2"/>
        </b-col>
      </b-row>
    </div>

  </b-container>

</template>

<script>

  export default {

    data() { 
      return {
        productDescription: 'a food delivery app',
        userDefinedDescription: false,
        generated: false
      }
    },

    computed: {
      productDescriptionInput: () => window.document.getElementById('productDescription')
    },

    mounted() {
      this.focus('product-description', 'select')
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

  h2 {
    margin-top: 50px;
  }

</style>