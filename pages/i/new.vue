<template>
  <MyContainer :hide-breadcrumbs="!build" fluid>
    <b-row align-h="center">
      <b-col cols="12" lg="8">
        <h1 class="text-center display-6 fw-bold mb-4">
          Idea » Landing page » Leads!
        </h1>
        <p class="lead">
          How many times have you had an idea for a new product, but didn’t know how to get started? Now you can create a landing page and start validating your idea with real leads in minutes.
        </p>
        <p>
          <strong>Just enter your idea, and watch the magic unfold!</strong>
        </p>
        <p class="text-end text-muted">Yours, <nuxt-link to="/">Ideality 🔺</nuxt-link></p>
      </b-col>
    </b-row>
    <BuildEdit v-model="code" v-on="{setFields}"/>

    <b-row v-if="completed" class="text-center">
      <b-col>
        <template v-if="status==''">
          <h2 class="display-6 mt-5 mb-3">
            Are you ready to start collecting leads?
          </h2>
          <b-button variant="success" size="lg" @click="createBuild">
            Heck yeah!
          </b-button>
        </template>
        <Loading v-if="status=='pending'" :message="(changed ? 'Saving': 'Generating') + ' your page, please wait...'"/>
      </b-col>
    </b-row>
    <b-row style="height: 10vh">
    </b-row>
  </MyContainer>
</template>

<script>

  import { filter } from 'lodash'

  export default {

    data() {

      return {
        build: null,
        code: {},
        status: '',
        pending: false,
        done: false,
        loaded: false,
        changed: false,
        name: '',
        content: {},
        shared: false,
        widgets: null,
        hideDescription: false
      }

    },

    mounted() {
      this.syncLocal('p/new', {
        select: ['code']
      })
      if ( !this.code )
        this.code = {}
      if ( !this.code.blocks )
        this.$set(this.code, 'blocks', [])
    },

    computed: {

      buildEditRoute() {
        let { slug, secret } = this.build
        // console.log({slug, secret})
        return {name: 'i-slug-manage', params: { slug }, query: { secret }}
      },

      buildRoute() {
        let { slug } = this.build
        // console.log({slug})
        return {name: 'i-slug', params: { slug }}
      },

      completed() {
        return this.loaded && this.code && !filter( this.code.blocks, block => !block?.content?.output ).length
      }

    },

    watch: {
      code: {
        deep: true,
        handler(code, oldCode) {
          if ( this.build && oldCode) {
            this.changed = true
            this.status = ''
          }
        }
      }
    },

    methods: {

      async createBuild() {
        let { code, name } = this
        this.status = 'pending'
        Object.assign(this, await this.bubble.go('createBuild', {
          code,
          name,
          public: true
        }))
        this.status = 'ok'
        this.code = {}
        this.$router.push({
          name: 'i-slug-section',
          params: { slug: this.build.slug, section: 'edit' },
          hash: '#firstTime',
          query: { secret: this.build.secret }
        })
      }
    }

  }

</script>