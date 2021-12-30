<template>
  <FullBox>
    <h2>
      Beta access request
    </h2>
    <template v-if="sent">
      <p class="lead">
        <b>Well received! We will get back to you as soon as we can.</b>
      </p>
    </template>
    <template v-else>
      <p>
        Ideality is currently in private beta, but we’re eager to onboard new users.
        Request your access below, and we’ll get back to you real fast.
      </p>
      <b-form>
        <MyForm v-model="request" :fields="{
          email: { id: 'email', type: 'email', placeholder: 'gbr@openai.com', lazy: true, handler: setSlugFromEmail,
            props: {
              name: 'username',
              autocomplete: 'username'
            }
          },
          slug: { caption: 'Username', placeholder: 'a-z, 0-9, -', status: status.slug, lazy: true, handler: slugChanged},
          password: { type: 'password', 
            props: {
              name: 'password',
              id: 'password',
              autocomplete: 'new-password'
            }
          },
          repeatPassword: { caption: 'Repeat password', type: 'password', 
            status: status.password, handler: checkrepeatPassword, lazy: true, 
            props: {
              name: 'password',
              id: 'password',
              autocomplete: 'new-password'
            }
          },
          bio: { multiline: true, placeholder: 'Write a few words about yourself and your plans. Can be as short as your Twitter handle.'}
        }"/>
        <b-button type="submit" :disabled="!valid" size="lg" class="mt-2" variant="primary" @click.prevent="send">
          Send
        </b-button>
      </b-form>
    </template>
  </FullBox>
</template>

<script>

  import Bubble from '~/plugins/bubble'
  import { get } from 'lodash'

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
        sent: false,
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
          && get(this, 'status.slug.ok')
          && get(this, 'status.password.ok')
        )
      }
    },

    mounted() {
      window.document.getElementById('email').focus()
    },

    methods: {

      checkrepeatPassword() {
        this.$set( this.status, 'password', 
          this.request.password == this.request.repeatPassword
          ? { ok: true }
          : { message: 'Passwords do not match', ok: false }
        )
      },

      async send() {
        let { email, password, slug, bio } = this.request
        await Bubble.anon.go('requestAccess', {
          email, password, slug, bio
        })
        this.sent = true
      },

      setSlugFromEmail(email) {

        this.slugChanged(this.request.slug = email.replace(/@.*/, ''))

      },

      async slugChanged(slug) {

        if ( slug.length < 3) {
          this.$set(this.status, 'slug', { ok: false, message: 'Please enter at least 3 characters' })
          return 
        }

        let newSlug = slug.replace(/[^\w\d]/g, '')

        this.$set(this.status, 'slug', { message: 'Checking availability...' })
        newSlug = (
          await Bubble.anon.go('testSlug', { slug: newSlug })
        ).user.slug
        if ( slug != newSlug ) {
          this.$set(this.request, 'slug', newSlug )
          this.$set(this.status, 'slug', { message: 'Fixed!', ok: true })
        } else {
          this.$set(this.status, 'slug', { message: 'Available!', ok: true })
        }

      }

    }

  }

</script>