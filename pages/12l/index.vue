<template>
  <Container hide-breadcrumbs fluid>
    <b-row align-h="center">
      <b-col cols="12" lg="8">
        <h1 class="text-center display-6 fw-bold mb-4">
          Idea » Landing page » Leads!
        </h1>
        <p class="lead" v-html="$md.render('How many times have you had an idea for a new product, but didn’t know how to get started? Now you can create your own lead generation page in minutes. \n\n**Just enter your idea, and watch the magic unfold!**')"/>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col v-if="widgets" class="px-0">
        <div :style="queryTags.testing && 'height: 100vh; overflow:hidden; overflow-y:auto'">
          <!-- <LabeledInput v-model="hideDescription" type="boolean" caption="Hide descriptions"/> -->
          <div v-for="widget, i in widgets" :key="widget.slug">
            <div v-if="i == 0 || widgets[i-1].content.output" :class="'py-3 px-2 px-lg-5' + ( i % 2 ? ' bg-light' : '')">
              <!-- <hr v-if="i != 0"/> -->
              <WidgetProper 
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
        <h2 class="display-6 mt-5 mb-3">
          Do you want to share the page &amp; start collecting leads?
        </h2>
        <b-button variant="success" size="lg" @click="shared=true">
          Heck yeah!
        </b-button>
        <div v-if="shared">
          <Load what="build" v-on="{setFields}" :fetch="() => 
            bubble.go('createBuild', {
              code,
              name,
              public: true
            })"
          />
          <template v-if="build">
            <h3>Here you go!</h3>
            <div>
              <strong>
                Link to share:
              </strong>
              <a :href="buildLink" target="_blank" v-text="buildLink"/>
            </div>
            <div>
              <strong>
                Link for you to edit (SAVE IT!):
              </strong>
              <a :href="buildLink+'/'+build.secret" target="_blank" v-text="buildLink+'/'+build.secret"/>
            </div>
          </template>
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

      await Promise.all(map(widgets, async widget => {
        let { inputs, slug } = widget
        Object.assign(widget, {
          ...await this.bubble.get('widget', slug),
          inputs: map(inputs, slug => find(widgets, { slug })),
          content: {}
        })
      }))

      Object.assign(this, { widgets })

    },

    computed: {

      buildLink() {
        return `https://ideality.app/b/${ this.build.slug }`
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

    methods: {
      dedent, map
    }

  }

</script>

<style>

</style>