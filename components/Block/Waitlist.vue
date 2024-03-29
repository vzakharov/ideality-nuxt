<!-- Modal to request access to a build -->
<template>
  <b-modal id="waitlist" hide-header hide-footer centered v-model="show">
    <div v-if="!accessRequested">
      <b-alert show v-if="unsubscribed">
        You’ve been unsubscribed! Re-subscribe at any time by filling out the form below.
      </b-alert>
      <template v-else>
        <h2 class="display-6">
          Thank you for your interest!
        </h2>
        <p class="lead"
          v-text="message || 'We are not yet available publicly — leave your email below, so we can ping you once we have something to show you!'"
        />
      </template>
      <MyForm
        v-model="vm"
        :fields="{
          email: { description: 'Only the idea’s owner(s) and Ideality admins will see this.', type: 'email', placeholder: 'jane@example.com' },
          comments: { placeholder: 'Anything you would like to add.', multiline: true}
        }"
      />
      <b-button :disabled="!email.match(/.+@.+\..+/)" class="mt-3" type="submit" size="lg" variant="primary" v-text="'Request access'"
        @click.prevent="sendRequest"
      />
    </div>
    <b-alert :show="accessRequested" variant="success" v-html="$md.render(
`### We received your request!

Please **confirm your email** by clicking the link in an email we just sent you.

You can withdraw your request at any time by following the unsubscribe link in the same email.`)"/>
    <b-alert :show="error" variant="danger">Something went wrong. Please try again later.</b-alert>
  </b-modal>
</template>

<script>

  export default {

    props: ['build', 'value', 'message'],
    
    data() {

      return {
        error: false,
        sending: false,
        email: '',
        comments: '',
        accessRequested: false,
        confirmationCode: null,
        creationCode: null,
        requestId: null,
        unsubscribed: false,
        justRequested: false
      }

    },

    mounted({ build: { id }} = this) {
      this.syncLocal('builds', {
        select: ['accessRequested', 'unsubscribed', 'requestId', 'confirmationCode', 'creationCode'],
        where: { id },
        inline: true
      })
      this.syncLocal('user', { select: ['email'], inline: true })
    },

    computed: {

      show: {
        get() { return this.value },
        set(value) { this.$emit('input', value) }
      }
    },

    methods: {


      async sendRequest() {
        let { email, comments, build} = this
        try {
          this.sending = true
          this.creationCode = await this.bubble.go('buildRequest_v2', { build: build.id, email, comments })
          this.accessRequested = true
          this.build.accessRequested = true
          this.justRequested = true
          // Todo: combine all into build
        } catch(error) {
          Object.assign(this, { error })
        }
      },

      async unsubscribe() {
        let { email, creationCode } = this
        let { id } = build
        await this.bubble.go('cancelBuildRequest', { id, email, creationCode })
        let changes = {
          unsubscribed: true,
          accessRequested: undefined,
          requestId: undefined,
          confirmationCode: undefined
        }
        Object.assign(this, changes)
        Object.assign(this.build, changes)
        // Todo: bring all into build
      }
      
    }

  }

</script>
