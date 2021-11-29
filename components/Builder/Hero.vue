<template>
  <b-container fluid>
    <b-row align-h="center" class="gx-4" v-if="match">
      <b-col cols="12" md="5" align-self="center" class="text-center text-md-start">
        <h1 class="display-6">
          <strong>
            {{ headline }}
          </strong>
        </h1>
        <p class="lead py-3">
          {{ text }}
        </p>
        <b-button variant="primary">
          {{ cta }}
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  export default {

    props: ['widget', 'content'],

    data() {

      let match = this.content.output.match(
        /(?<headline>^.*)\n+(?<text>.*)\n+Image for "(?<imageQuery>.*)"\n+\[(?<cta>.*)\]/
      )

      let { groups } = match || { groups: {}}

      return { match, ...groups } 

    },

  }

</script>

<style>

</style>