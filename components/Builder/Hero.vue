<template>
  <b-row align-h="center" class="gx-4" v-if="loaded">
    <b-col cols="12" lg="6" xl="5" align-self="center" class="text-center text-lg-start">
      <h1 class="display-5 mb-3">
        <strong>
          {{ headline }}
        </strong>
      </h1>
      <PexelsImage class="d-lg-none" :query="imageQuery" orientation="landscape"/>
      <div>
        <p class="lead pt-3" v-html="$md.render(text)"/>
        <b-button size="lg" variant="primary">
          {{ cta }}
        </b-button>
      </div>
    </b-col>
    <b-col cols="6" lg="4" xl="3" class="d-none d-lg-block">
      <PexelsImage :query="imageQuery" orientation="portrait"/>
    </b-col>
    <!-- <b-col cols="3" align-self="center" class="d-none d-lg-block">
      <PexelsImage :query="imageQuery"/>
    </b-col> -->
  </b-row>
</template>

<script>

  export default {

    props: ['content'],

    data() {

      try {
        let match = this.content.output.match(
          /(Brief.*\n+)?(?<headline>.*)\n+(?<text>.*)\n+Image for ["“](?<imageQuery>.*)["”]\n+\[(?<cta>.*)\]/
        )

        let { groups } = match

        return { loaded: true, match, ...groups } 
      } catch(error) {
        return { error, loaded: false}
      }

    },

  }

</script>

<style>

  .h1-responsive {
    font-size: calc(90% + 3.5vw);
  }

</style>