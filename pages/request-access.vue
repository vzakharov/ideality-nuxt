<template>
  <FullBox>
    <p>
      Ideality is currently in private beta, but we’re eager to onboard new users.
      Request your access below, and we’ll get back to you real fast.
    </p>
    <ObjectConfig v-model="request" :fields="{
      email: { id: 'email', type: 'email', placeholder: 'gbr@openai.com', lazy: true, handler: setSlugFromEmail },
      slug: { caption: 'Username', placeholder: 'a-z, 0-9, -', status: status.slug, lazy: true, handler: slugChanged },
      password: { type: 'password' },
      repeatPassword: { caption: 'Repeat password', type: 'password', status: status.password, handler: checkrepeatPassword, lazy: true },
      bio: { multiline: true, placeholder: 'Write a few words about yourself and your plans. Can be as short as your Twitter handle.'}
    }"/>
    <b-button :disabled="!valid" size="lg" class="mt-2" variant="primary" @click="send">
      Send
    </b-button>
  </FullBox>
</template>

<script>

  import Bubble from '~/plugins/bubble'
  import { assign, get } from 'lodash'

  export default {

    data() {

      return {
        request: {
          email: '',
          slug: '',
          password: '',
          repeatPassword: '',
          bio: this.$route.query.bio,
        },
        status: {
          slug: null,
          password: null
        }
      }

    },

    computed: {
      valid() {
        return (
          this.request.email
          && this.status.slug.ok
          && this.status.password.ok
        )
      }
    },

    mounted() {
      window.document.getElementById('email').focus()
    },

    methods: {

      checkrepeatPassword(repeat) {
        this.$set( this.status, 'password', 
          this.request.password == this.request.repeatPassword
          ? { ok: true }
          : { message: 'Passwords do not match', ok: false }
        )
      },

      async send() {

      },

      setSlugFromEmail(email) {

        this.slugChanged(this.request.slug = email.replace(/@.*/, ''))

      },

      async slugChanged(slug) {

        if ( slug.length < 3) {
          this.$set(this.status, 'slug', { ok: false, message: 'Please enter at least 3 characters' })
          return 
        }

        this.status.slug = { message: 'Checking availability...' }
        let  { user: { slug: newSlug }} = await Bubble.anon.go('testSlug', { slug })
        if ( slug != newSlug ) {
          assign(this.request, { slug: newSlug })
          this.$set(this.status, 'slug', { message: 'Fixed!', ok: true })
        } else {
          this.$set(this.status, 'slug', { message: 'Available!', ok: true })
        }

      }

    }

  }

</script>

<style>

</style>