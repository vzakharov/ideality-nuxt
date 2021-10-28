<template>

  <b-container class="mt-5" style="max-width: 800px; margin-bottom: 300px">

    <h1 class="display-1">Ideality Widget 🔺</h1>
    <h2 class="lead">AI-powered ideas for your users</h2>
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

    <h2>Let’s try!</h2>

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

    <div v-if="productDescription" class="mt-5">

      <h5>
        <span v-if="userDefinedDescription">Excellent! </span>Here’s how a widget for your users might look like. Try it out!
      </h5>
      <p class='form-text text-muted'>
        (Click on 🎲 to generate random user bios.) 
      </p>

      <WidgetProper class="border shadow rounded m-5 p-3"
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
      />

    </div>

    <div v-if="generated">
      Impressive, isn’t it?
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

<style>

  p {
    margin-bottom: 25px;
    font-size: 20px;
  }

</style>