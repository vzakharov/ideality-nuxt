<template>

  <b-container class="mt-5" style="max-width: 800px; margin-bottom: 300px">
    <Breadcrumbs/>
    <h1 class="display-1">Ideality Widget 🔺</h1>
    <h2 class="display-6 fw-bold">AI-powered ideas for your users</h2>
    <hr>
    <p>
      Sometimes, people don’t need your product. Other times, they just need a little push.
      Ideality Widget encourages your users to use your product by giving them ideas.
    </p>

    <p>
      Let’s try a little experiment. Enter a brief description of your product.
    </p>

    <LabeledInput 
      caption="Describe your product"
      placeholder="E.g. “a bookmarking app”"
      id="product-description"
      :description="!productDescription ? 'Enter a description to continue' : 'Enter any other description if you wish'"
      v-model="productDescription"
      :lazy="true"
    />
    <!-- <b-button variant="primary"
    >
      Show me the widget!
    </b-button> -->

    <div v-if="productDescription || isTest" class="mt-5">

      <template v-if="!generated">
          Please wait, preparing your widget... <b-spinner small variant="grow danger"></b-spinner>
      </template>
      <div v-show="generated">
        <h5 id="widget-demo">
          <span v-if="userDefinedDescription">Excellent! </span>
          Here’s how a widget for your users might look like. Try it out!
        </h5>
        <div class='form-text text-muted'>
          (Click on 🎲 to generate random user bios.) 
        </div>
        
        <b-row align-h="center">
          <b-col cols="12" sm="11" md="10">
            <WidgetProper class="border shadow rounded my-5 p-3"
              :widget="{
                id: 'demo',
                setup: {
                  parameterValues: {
                    Product: productDescription
                  }
                },
                display: {
                  inputCaption: 'User bio (this is what the user will enter in the widget)',
                  inputPlaceholder: 'e.g. “I am a …” or “We are …”',
                  outputCaption: 'Suggestions for your user'
                }
              }"
              @generated="generated=true; withElement('product-description', 'scrollIntoView')"
              :go="true"
              :dontFocusOnOutput="true"
            />
          </b-col>
        </b-row>

        <h5>Impressed?</h5>
        <p>
          The real thing is even better, as you can flexibly customize it to match your 
          specific product and goals. You can watch some of the customized examples
          <nuxt-link to="widget/examples">here</nuxt-link>.
        </p>

        <Heading>How much?</Heading>
        <p>
          As we’re using a super-efficient AI, Ideality Widget is surprisingly affordable.
          In fact, <b>early adopters get 100 generations for free</b>, so you can try it out
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
    </div>

  </b-container>

</template>

<script>

  export default {

    data() { 
      return {
        productDescription: '',
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

</style>