<template>
  <div>
    <template v-if="!requested">
      <ObjectConfig
        v-model="request"
        :fields="{
          email: { caption: 'Email', type: 'email', placeholder: 'gdb@openai.com', id: 'access-request-email'},
          bio: { caption: 'Bio', placeholder: 'Anything you want to tell about yourself and/or why you want this widget. Can be as short as your Twitter handle.', multiline: true}
        }"
      />
      <b-button size="lg" class="mt-2" variant="primary" :disabled='!(request.email && request.bio)'
        @click="send"
      >
        Submit
      </b-button>
    </template>
    <div class="py-2 text-center">We received your request and will get back to you soon!</div>
  </div>
</template>

<script>

  import Bubble from '~/plugins/bubble'

  export default {

    props: ['value'],

    data() { console.log(this.value); return {
      request: this.value || {},
      requested: undefined
    }},

    mounted() {
      this.requested = localStorage.getItem('betaRequested')
    },

    methods: {

      async send() {
        try {
          await Bubble.anon.go('requestBeta', this.request)
          this.requested = true
          localStorage.setItem('betaRequested', true)
        } catch(e) {
          window.alert(e.toString()+'; Please contact the developer.')
        }
      }

    }

  }

</script>

<style>

</style>