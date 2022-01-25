<template>
  <b-row align-h="center">
    <b-col style="max-width: 800px" class="px-2 px-md-5">
      <b-row align-h="center" class="gx-4" v-if="loaded">
        <h1 :class="'fw-bold display-6 text-center mb-5'">{{ name }}</h1>
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
                </b-col>
              </b-row>
            </b-col>
            <div v-show="imageLoaded" :class="'d-none d-md-block ' + ( imageLoaded && 'col col-4' )">
              <PexelsImage :query="imageQuery" @loaded="imageLoaded = $event" orientation="portrait"/>
            </div>
          </b-row>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>

  import dedent from 'dedent-js'
  import render from '~/plugins/mixins/render'

  export default {
  
    mixins: [ render ],

    props: ['content', 'size', 'build'],

    data() {
      
      let pattern = dedent`
        # %name\\. %headline

        %text

        (Keywords: |Image for ["“])%imageQuery["”]?

        \\[%cta\\]
      `

      return { 
        loaded: false, 
        name: '',
        headline: '',
        text: '',
        imageQuery: '',
        cta: '',
        imageLoaded: false,
        pattern        
      } 

    }

  }

</script>