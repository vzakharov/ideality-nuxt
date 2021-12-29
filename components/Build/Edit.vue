<!-- Build editor. Essentially a (for now hardcoded) sequence of widgets. Each subsequent widget uses the previous one's output as its input -->
<template>
  <b-row align-h="center">
    <Loading v-if="!blocks || !widgets" message="Loading the editor..."/>
    <b-col v-else class="px-0">
      <div :style="queryTags.testing && 'height: 100vh; overflow:hidden; overflow-y:auto'">
        <div v-for="widget, i in widgets" :key="widget.slug">
          <div v-if="i == 0 || blocks[i-1].content.output" :class="'py-3 px-2 px-lg-5' + ( i % 2 ? ' bg-light' : '')">
            <WidgetProper 
              v-bind="{
                widget,
                key: widget.slug,
                value: {
                  input: i == 0 ? blocks[i].content.input : widget.inputs.map( ( widget, j ) => 
                    j == 0 ? [
                      blocks[j].content.input,
                      blocks[j].content.output
                    ].join('\n\n') : blocks[j].content.output 
                  ).join('\n\n'),
                  output: blocks[i].content.output
                },
                hideInput: i != 0,
                hideDescriptionIfOutput: true,
                showEditingTip: i == 0
              }"
              @input="i == 0 ? $set(blocks[i], 'content', $event) : $set(blocks[i].content, 'output', $event.output)"
              @contentParsed="i == 0 && $emit('setFields', $event)"
              hide-background hide-powered-by
            />
          </div>
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<script>

  import { assign, filter, find, map } from 'lodash'
  
  export default {

    props: ['value'],

    data() {

      return {
        status: '',
        pending: false,
        changed: false,
        done: false,
        error: null,
        name: '',
        content: {},
        shared: false,
        widgets: null,
        hideDescription: false
      }

    },

    async mounted() {

      const [ HERO, STORY, DETAILS, PUNCHLINE ] =
        [
          'builder-hero',
          'builder-story-v2',
          'builder-details-v2',
          'builder-punchline'
        ]

      let widgets = [
        {
          slug: HERO
        }, {
          slug: STORY,
          inputs: [ HERO ]
        }, {
          slug: DETAILS,
          inputs: [ HERO, STORY ]
        }, {
          slug: PUNCHLINE,
          inputs: [ HERO, DETAILS ]
        }
      ]

      if ( !this.code.blocks ) {
        this.$set(this.code, 'blocks', [])
      }

      await Promise.all(map(widgets, async ( widget, i ) => {
        let { inputs, slug } = widget
        assign(widget, {
          ...await this.bubble.get('widget', slug),
          inputs: map(inputs, slug => find(widgets, { slug }))
        })
        if ( !this.blocks[i] ) {
          this.$set(this.code.blocks, i, { content: {}, type: widget.display.native.componentName })
        }
      }))

      this.$emit('setFields', { loaded: true })

      assign(this, { widgets })

    },

    computed: {

      code() {
        return this.value
      },
      
      blocks() {
        return this.code?.blocks
      },

      completed() {
        return this.blocks?.filter && !filter( this.blocks, block => !block?.content?.output ).length
      }

    },

    methods: {

      async updateBuild({ build: { id, secret }, code, name } = this) {
        this.status = 'pending'
        try {
          assign(this, await this.bubble.go('updateBuild', {
            id,
            secret,
            code,
            name
          }))
          this.status = 'ok'
        } catch(error) {
          this.status = 'error'
          assign(this, { error })
        }
      }

    }

  }

</script>

<style>

</style>