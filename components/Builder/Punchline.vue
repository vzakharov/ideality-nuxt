<template>
  <b-row align-h="center">
    <b-col cols="12" lg="8">
      <h2 class="fw-bold display-6 mb-3" v-text="headline"/>
      <b-button size="lg" variant="primary" v-text="cta"/>
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
          /## +(?<headline>.*)\n\n\[(?<cta>.*)\]/
        )

        let { groups } = match

        return { loaded: true, match, ...groups } 
      } catch(error) {
        return { error, loaded: false}
      }

    },

  }

</script>