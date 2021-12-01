<template>
  <b-row align-h="center" class="gx-4" v-if="loaded">
    <h1 v-if="title" class="fw-bold display-4 text-center mb-5">{{ title }}</h1>
    <b-col 
      v-bind="cols({
        cols: 12,
        md: 6,
        xl: 5
      }, { root: true })" align-self="center" class="text-center text-lg-start"
    >
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

  import { chain, forEach, indexOf, mapKeys } from 'lodash'

  export default {

    props: ['content', 'size'],

    data() {

      debugger
      try {
        let match = this.content.output.match(
          /(Brief.*\n+)?# +((?<title>.*?)\. )?(?<headline>.*)\n+(?<text>.*)\n+Image for ["“](?<imageQuery>.*)["”]\n+\[(?<cta>.*)\]/
        )

        let { groups } = match

        return { loaded: true, match, ...groups } 
      } catch(error) {
        return { error, loaded: false}
      }

    },

    methods: {

      cols(breakpoints, { root }) {

        debugger
        let widths = [ 540, 720, 960, 1140, 1320 ]
        let { size } = this
        let defaultSize = 'xl'
        if ( !size ) size = defaultSize
        let sizes = ['cols', 'sm', 'md', 'xl', 'xxl']
        let getIndex = size => indexOf(sizes, size)
        
        let allCols = {}
  
        forEach(breakpoints, (cols, breakpoint) => {

          if ( breakpoint == 'cols' )
            return allCols[breakpoint] = cols

          let index = getIndex(breakpoint)
          let defaultIndex = getIndex(defaultSize)
          let diff = defaultIndex - index
          let newIndex = index + diff

          if ( newIndex > 4)
            return

          allCols[sizes[newIndex]] = root ? Math.ceil(cols*widths[index]/widths[defaultIndex]) : cols
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