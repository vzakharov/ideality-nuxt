<template>
  <b-row align-h="center">
    <b-col style="max-width: 800px" class="px-2 px-md-5">
      <b-row align-h="center" class="gx-4" v-if="loaded">
        <h1 :class="'fw-bold display-6 text-center mb-5'">{{ title }}</h1>
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
                  <p class="lead pt-3" style="font-size: calc(1rem + 0.5vw)" v-html="$md.render(text) || 'Lorem ipsum'"/>
                  <b-button size="lg" variant="primary" v-b-modal.waitlist>
                    {{ cta }}
                  </b-button>
                  <BuilderWaitlist/>
                </b-col>
              </b-row>
            </b-col>
            <div v-show="imageLoaded" :class="'d-none d-md-block ' + ( imageLoaded && 'col col-4' )">
              <PexelsImage :query="imageQuery" @loaded="imageLoaded = $event" orientation="portrait"/>
            </div>
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
  import dedent from 'dedent-js'
  import renderMixin from '~/plugins/render'

  export default {
  
    mixins: [ renderMixin ],

    props: ['content', 'size'],

    data() {
      
      let pattern = dedent`
        # %title\\. %headline

        %text

        Keywords: %imageQuery

        \\[%cta\\]
      `

      return { 
        loaded: false, 
        title: null,
        headline: null,
        text: null,
        imageQuery: null,
        cta: null,
        imageLoaded: false,
        pattern        
      } 

    }

  }

</script>