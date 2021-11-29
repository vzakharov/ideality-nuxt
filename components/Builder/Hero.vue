<template>
  <b-container fluid>
    <b-row align-h="center" class="gx-4" v-if="match">
      <b-col cols="12" lg="5" align-self="center" class="text-center text-lg-start">
        <h1 class="display-6">
          <strong>
            {{ headline }}
          </strong>
        </h1>
        <PexelsImage :query="imageQuery" class="d-lg-none"/>
        <p class="lead py-3" v-html="$md.render(text)"/>
        <b-button size="lg" variant="primary">
          {{ cta }}
        </b-button>
      </b-col>
      <b-col cols="3" align-self="center" class="d-none d-lg-block">
        <PexelsImage :query="imageQuery"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  export default {

    props: ['widget', 'content'],

    data() {

      let match = this.content.output.match(
        /.*\n\n(?<headline>.*)\n+(?<text>.*)\n+Image for ["“](?<imageQuery>.*)["”]\n+\[(?<cta>.*)\]/
      )

      let { groups } = match || { groups: {}}

      return { match, ...groups, imageSrc: null } 

    },

  }

</script>

<style>

</style>