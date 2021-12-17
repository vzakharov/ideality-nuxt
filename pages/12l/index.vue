<template>
  <Container hide-breadcrumbs>
    <b-row class="gx-2">
      <b-col cols="4" v-if="widgets">
        <WidgetProper v-bind="{widget: widgets.hero}" v-model="content.hero" padding=0 hide-background hide-powered-by/>
        <template v-if="content.hero">
          <div v-html="$md.render(mergedContent)"/>
          <WidgetProper v-bind="{widget: widgets.benefits}" v-model="content.benefits" padding=0 hide-background hide-powered-by/>
        </template>
      </b-col>
      <b-col>
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
  import { chain, map, mapValues } from 'lodash'

  export default {

    data() {

      return {
        content: {},
        widgets: null
      }

    },

    async fetch() {

      const sequence = ['hero']

      let widgets = chain(await Promise.all(map(sequence, name =>
        this.bubble.get('widget', `builder-${name}`)
      ))).map(widget =>
        ({...widget,
          expanded: true
        })
      ).value()

      console.log({widgets})

      let [
        hero,
        benefits
      ] = await Promise.all([
        this.bubble.get('widget', 'builder-hero'),
        this.bubble.get('widget', 'just-add-ai')
      ])
      this.widgets = mapValues({
        hero, benefits
      }, value => ({
        ...value,
        expanded: true
      }))

    },

    computed: {

      mergedContent({ content: { hero, benefits }} = this) {
        return [
          '== Hero ==',
          hero.output
        ].join('\n\n')
      }

    }

  }

</script>

<style>

</style>