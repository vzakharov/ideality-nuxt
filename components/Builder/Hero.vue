<template>
  <b-row align-h="center" class="gx-4" v-if="loaded">
    <h1 v-if="title" class="fw-bold display-4 text-center mb-5">{{ title }}</h1>
    <b-col 
      v-bind="cols({
        xs: 12,
        md: 6,
        xl: 5
      })" align-self="center" class="text-center text-lg-start"
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

      cols(breakpoints, { size } = this) {

        // let replacements = {
        //   xs: {
        //     xs: 'xl',
        //     sm: 'xxl',
        //     md: 'xxl',
        //     lg: 'xxl',
        //     xxl: 'xxl'
        //   },
        //   sm: {
        //     xs: 'lg',
        //     sm: 'xl',
        //     md: 'xxl',
        //     lg: 'xxl',
        //     xxl: 'xxl'
        //   },
        // }


        debugger
        let defaultSize = 'xl'
        if ( !size ) size = defaultSize
        let sizes = ['xs', 'sm', 'md', 'xl', 'xxl']
        let getIndex = size => indexOf(sizes, size)
        
        let allCols = {}

        forEach(breakpoints, (cols, breakpoint) => {
          let index = getIndex(breakpoint)
          let parentIndex = getIndex(size)
          let diff = parentIndex - index
          if ( diff < 0 )
            !allCols['xxl'] & ( allCols['xxl'] = cols )
          else if ( diff == 0 )
            allCols['xl'] = cols
          else
            allCols[sizes[index + diff || 'cols']] = cols
        })

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