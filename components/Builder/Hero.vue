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

    methods: {

      cols(breakpoints, { root } = {}) {

        let widths = [ 540, 720, 960, 1140, 1320 ]
        let { size } = this
        let defaultSize = 'xl'
        if ( !size ) size = defaultSize
        let sizes = ['cols', 'sm', 'md', 'lg', 'xl']
        let getIndex = size => indexOf(sizes, size)
        
        let allCols = {}
  
        forEach(breakpoints, (cols, breakpoint) => {

          if ( breakpoint == 'cols' )
            return allCols[breakpoint] = cols

          let index = getIndex(breakpoint)
          let defaultIndex = getIndex(size)
          let diff = defaultIndex - index
          let newIndex = index + diff

          if ( newIndex > 4)
            return

          allCols[sizes[newIndex]] = root ? Math.floor(cols*widths[index]/widths[defaultIndex]) : cols
        })

        console.log({allCols})
        return allCols

      }

    }

  }

</script>

<style>

  .h1-responsive {
    font-size: calc(90% + 3.5vw);
  }

</style>