<template>
  <Container :hide-breadcrumbs="!build" fluid>
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
    <b-row align-h="center">
      <b-col class="px-0">
        <Loading class="text-center" v-if="!widgets" message="Loading the tool, please wait..."/>
        <div v-else :style="queryTags.testing && 'height: 100vh; overflow:hidden; overflow-y:auto'">
          <!-- <LabeledInput v-model="hideDescription" type="boolean" caption="Hide descriptions"/> -->
          <div v-for="widget, i in widgets" :key="widget.slug">
            <div v-if="i == 0 || widgets[i-1].content.output" :class="'py-3 px-2 px-lg-5' + ( i % 2 ? ' bg-light' : '')">
              <!-- <hr v-if="i != 0"/> -->
              <Widget 
                v-bind="{
                  widget,
                  key: widget.slug,
                  value: {
                    input: i == 0 ? widget.content.input : widget.inputs.map( widget => widget.content.output ).join('\n\n'),
                    output: widget.content.output
                  },
                  hideInput: i != 0,
                  hideDescriptionIfOutput: true,
                  showEditingTip: i == 0
                }"
                @input="i == 0 ? $set(widget, 'content', $event) : $set(widget.content, 'output', $event.output)"
                @contentParsed="i == 0 && ( name = $event.name )"
                hide-background hide-powered-by
              />
            </div>
          </div>
        </div>
      </b-col>
    </b-row>
    <b-row v-if="completed" class="text-center">
      <b-col>
        <template v-if="status==''">
          <h2 class="display-6 mt-5 mb-3" 
            v-text="changed
              ? 'You changed the page. Save the changes?' 
              : 'Are you ready to start collecting leads?'
            "
          />
          <b-button :variant="changed ? 'danger' : 'success'" size="lg" @click="changed ? updateBuild() : createBuild()"
            v-text="changed
              ? 'Save'
              : 'Heck yeah!'
            "
          />
        </template>
        <Loading v-if="status=='pending'" :message="(changed ? 'Saving': 'Generating') + ' your page, please wait...'"/>
        <em v-else-if="status=='ok'" v-text="'Done!'"/>
        <div v-if="build">
          <h3 v-text="'Here you go!'"/>
          <div>
            <strong>
              Link to share:
            </strong>
            <nuxt-link :to="buildRoute" v-text="'ideality.app'+$router.resolve(buildRoute).href"/>
          </div>
          <div>
            <strong>
              Link for you to edit (SAVE IT!):
            </strong>
            <nuxt-link :to="buildEditRoute" v-text="'ideality.app'+$router.resolve(buildEditRoute).href"/>
          </div>
        </div>
      </b-col>
    </b-row>
    <b-row style="height: 10vh">
    </b-row>
  </Container>
</template>

<script>

  import Bubble from '~/plugins/bubble'
  import { chain, filter, find, forEach, map, mapValues } from 'lodash'
  import dedent from 'dedent-js'

  export default {

    data() {

      return {
        build: null,
        status: '',
        pending: false,
        done: false,
        changed: false,
        name: '',
        content: {},
        shared: false,
        widgets: null,
        hideDescription: false
      }

    },

    async fetch() {

      let widgets = [
        {
          slug: 'builder-hero'
        }, {
          slug: 'builder-story',
          inputs: ['builder-hero']
        }, {
          slug: 'builder-details',
          inputs: ['builder-hero']
        }, {
          slug: 'builder-punchline',
          inputs: ['builder-hero', 'builder-details']
        }
      ]

      let { slug, secret} = this.$route.query

      if ( slug && secret ) {
        Object.assign(this, await this.bubble.go('getBuildBySecret', { slug, secret }))
        this.status = 'ok'
      }

      await Promise.all(map(widgets, async ( widget, i ) => {
        let { inputs, slug } = widget
        Object.assign(widget, {
          ...await this.bubble.get('widget', slug),
          inputs: map(inputs, slug => find(widgets, { slug })),
          content: this.build?.code?.blocks?.[i]?.content || {}
        })
      }))

      Object.assign(this, { widgets })

    },

    computed: {

      buildEditRoute() {
        let { slug, secret } = this.build
        return {name: '12l', query: { slug, secret }}
      },

      buildRoute() {
        let { slug } = this.build
        return {name: 'b-slug', params: { slug }}
      },

      code({ widgets } = this) {
        if ( !widgets )
          return
        return {
          blocks: widgets.map(({
            content,
            display: { native: { componentName: type }}
          }) => ({
            content,
            type
          }))
        }
      },

      completed() {
        return this.widgets && !filter( this.widgets, widget => !widget?.content?.output ).length
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

      async createBuild({ code, name } = this) {
        this.status = 'pending'
        Object.assign(this, await this.bubble.go('createBuild', {
          code,
          name,
          public: true
        }))
        this.status = 'ok'
      },

      async updateBuild({ build: { id, secret }, code, name } = this) {
        this.status = 'pending'
        Object.assign(this, await this.bubble.go('updateBuild', {
          id,
          secret,
          code,
          name
        }))
        this.status = 'ok'
      },

      dedent, map
    }

  }

</script>