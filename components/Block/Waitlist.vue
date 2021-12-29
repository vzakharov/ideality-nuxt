<!-- Modal to request access to a build -->
<template>
  <b-modal id="waitlist" hide-header hide-footer centered>
    <div v-if="!accessRequested">
      <h2 class="display-6">
        Thank you for your interest!
      </h2>
      <p class="lead">
        We are not yet available publicly — leave your email below, so we can ping you once we have something to show you!
      </p>
      <MyForm
        v-model="vm"
        :fields="{
          email: { description: 'We promise not to spam you.', type: 'email', placeholder: 'jane@example.com' },
          comments: { placeholder: 'Anything you would like to add.', multiline: true}
        }"
      />
      <b-button :disabled="!email.match(/.+@.+\..+/)" class="mt-3" type="submit" size="lg" variant="primary" v-text="'Request access'"
        @click.prevent="sendRequest"
      />
    </div>
    <b-alert :show="accessRequested" variant="success" v-html="$md.render(
`### We received your request!

If you haven’t already, please **follow the link in the confirmation email we sent you**, so we can keep you posted.`)"/>
    <b-alert :show="error" variant="danger">Something went wrong. Please try again later.</b-alert>
  </b-modal>
</template>

<script>

  export default {

    props: ['build'],
    
    data() {

      return {
        error: false,
        sending: false,
        email: '',
        comments: '',
        accessRequested: false
      }

    },

    mounted({ build: { slug }} = this) {
      this.syncLocal('builds', {
        select: ['accessRequested'],
        where: { slug }
      })
    },

    methods: {


      async sendRequest() {
        let { email, comments, build} = this
        try {
          this.sending = true
          await this.bubble.go('buildRequest', { build: build.id, email, comments })
          this.accessRequested = true
        } catch(error) {
          Object.assign(this, { error })
        }
      }
      
    }

  }

</script>
