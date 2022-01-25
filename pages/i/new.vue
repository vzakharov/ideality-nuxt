<template>
  <div>
    <NavPublic section="Tools" subsection="Builder" :target="{ name: 'ideas' }"
      v-if="$route.query.from!='12l'"
    />
    <b-container fluid>
      <b-row v-if="$route.query.from == '12l'" align-h="center">
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
          <Loading v-else-if="status=='pending'" message="Generating your page, please wait..."/>
          <Loading v-else-if="status=='ok'" message="Done! Redirecting..."/>
        </b-col>
      </b-row>
      <b-row style="height: 10vh">
      </b-row>
    </b-container>
  </div>
</template>

<script>

  import { filter } from 'lodash'

  export default {

    data() {

      return {
        build: null,
        code: {},
        status: '',
        loaded: false,
        name: ''
      }

    },

    mounted() {
      this.syncLocal('p/new', {
        select: ['code'],
        inline: true
      })
      if ( !this.code )
        this.code = {}
      if ( !this.code.blocks )
        this.$set(this.code, 'blocks', [])
    },

    computed: {

      completed() {
        return this.loaded && this.code && !filter( this.code.blocks, block => !block?.content?.output ).length
      }

    },

    methods: {

      async createBuild() {
        let { code, name } = this
        this.status = 'pending'
        Object.assign(this, await this.bubble.go('createBuild', {
          code,
          name,
          core: this.code.blocks[0].content.input,
          public: true
        }))
        this.status = 'ok'
        this.code = {}
        this.$router.push({
          name: 'i-slug-section',
          params: { slug: this.build.slug, section: 'edit' },
          query: { secret: this.build.secret },
          hash: '#firstTime'
        })
      }
    }

  }

</script>