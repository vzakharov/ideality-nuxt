<template>
  <b-container fluid>
    <b-row align-h="center" class="gx-4" v-if="match">
      <b-col cols="12" lg="9" align-self="center" class="text-center text-lg-start">
        <b-row>
          <b-col cols="12" lg="7">
            <h1 class="display-4 h1-responsive mb-3">
              <strong>
                {{ headline }}
              </strong>
            </h1>
          </b-col>
          <b-col cols="12" lg="5">
            <PexelsImage :query="imageQuery"/>
          </b-col>
        </b-row>
        <div>
          <p class="lead pt-3" v-html="$md.render(text)"/>
          <b-button size="lg" variant="primary">
            {{ cta }}
          </b-button>
        </div>
      </b-col>
      <!-- <b-col cols="3" align-self="center" class="d-none d-lg-block">
        <PexelsImage :query="imageQuery"/>
      </b-col> -->
    </b-row>
  </b-container>
</template>

<script>

  export default {

    props: ['widget', 'content'],

    data() {

      let match = this.content.output.match(
        /(Brief.*\n+)?(?<headline>.*)\n+(?<text>.*)\n+Image for ["“](?<imageQuery>.*)["”]\n+\[(?<cta>.*)\]/
      )

      let { groups } = match || { groups: {}}

      return { match, ...groups } 

    },

  }

</script>

<style>

  .h1-responsive {
    font-size: calc(90% + 3.5vw);
  }

</style>