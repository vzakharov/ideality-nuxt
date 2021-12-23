<template>
  <Container hide-breadcrumbs fluid="xl">
    <b-row align-h="center">
      <b-col cols="12" lg="8">
        <h1 class="text-center display-6 fw-bold mb-4">
          Got an idea? Get some leads!
        </h1>
        <p class="lead" v-html="$md.render('How many times have you had an idea for a new product, but didn’t know how to get started? Now you can create your own lead generation page in minutes. \n\n**Just enter your idea, and watch the magic unfold!**')"/>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col v-if="widgets">
        <div :style="queryTags.testing && 'height: 100vh; overflow:hidden; overflow-y:auto'">
          <!-- <LabeledInput v-model="hideDescription" type="boolean" caption="Hide descriptions"/> -->
          <div v-for="widget, i in widgets" :key="widget.slug">
            <div v-if="i == 0 || widgets[i-1].content.output" :class="{'bg-light': i % 2, 'py-3': true}">
              <!-- <hr v-if="i != 0"/> -->
              <WidgetProper 
                v-bind="{
                  widget,
                  key: i == 0 ? widget.slug : widgets[0].content.output,
                  value:
                  {
                    input: i == 0 ? widget.content.input : widget.inputs.map( widget => widget.content.output ).join('\n\n'),
                    output: widget.content.output
                  },
                  hideInput: i != 0,
                  hideDescriptionIfOutput: true,
                  showEditingTip: i == 0
                }"
                @input="i == 0 ? $set(widget, 'content', $event) : $set(widget.content, 'output', $event.output)"
                hide-background hide-powered-by
              />
            </div>
          </div>
        </div>
      </b-col>
      <b-col cols="7" v-if="queryTags.testing">
        <p v-if="!content.hero">
          Your landing page will appear here
        </p>
        <BuilderRender
          v-else
          class="scaled"
          v-bind="control({content: mergedContent})"
        />
      </b-col>
    </b-row>
  </Container>
</template>

<script>

  import Bubble from '~/plugins/bubble'
  import { chain, find, forEach, map, mapValues } from 'lodash'
  import dedent from 'dedent-js'

  export default {

    data() {

      return {
        content: {},
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

      mergedContent({ content: { hero, benefits }} = this) {
        return [
          '== Hero ==',
          hero.output
        ].join('\n\n')
      }

    },

    methods: {
      dedent, map
    }

  }

</script>

<style>

</style>