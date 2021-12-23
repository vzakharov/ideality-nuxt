<template>
  <b-row align-h="center">
    <b-col cols="12" lg="8">
      <b-row align-h="center" class="gx-4" v-if="loaded">
        <h1 v-if="title" class="fw-bold display-6 text-center mb-5">{{ title }}</h1>
        <b-col>
          <b-row align-h="center">
            <b-col align-self="center" class="text-center text-md-start">
              <h1 class="display-6 mb-3">
                <strong>
                  {{ headline }}
                </strong>
              </h1>
              <PexelsImage class="d-md-none" :query="imageQuery" orientation="landscape"/>
              <b-row>
                <b-col>
                  <p class="lead pt-3" style="font-size: calc(1rem + 0.5vw)" v-html="$md.render(text)"/>
                  <b-button size="lg" variant="primary">
                    {{ cta }}
                  </b-button>
                </b-col>
              </b-row>
            </b-col>
            <b-col cols="4" class="d-none d-md-block">
              <PexelsImage :query="imageQuery" orientation="portrait"/>
            </b-col>
          </b-row>
        </b-col>
        <!-- <b-col cols="3" align-self="center" class="d-none d-lg-block">
          <PexelsImage :query="imageQuery"/>
        </b-col> -->
      </b-row>
    </b-col>
  </b-row>
</template>

<script>

  import { chain, forEach, indexOf, mapKeys } from 'lodash'

  export default {

    props: ['content', 'size'],

    data() {

      let { content } = this
      if ( typeof content !== 'string' )
        content = content.output

      try {
        let match = content.match(
          /(Brief.*\n+)?# +((?<title>.*?)\. )?(?<headline>.*)\n+(?<text>.*)\n+Image for ["“](?<imageQuery>.*)["”]\n+\[(?<cta>.*)\]/
        )

        let { groups } = match

        return { loaded: true, match, ...groups } 
      } catch(error) {
        return { error, loaded: false}
      }

    },

  }

</script>