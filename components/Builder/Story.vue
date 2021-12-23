<template>
  <b-row align-h="center">
    <b-col cols="12" lg="8">
      <h2 class="display-6 mb-4" v-text="headline"/>
      <p class="lead" v-html="$md.render(text)"/>
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
          /## +(?<headline>.*)\n\n(?<text>.*)/
        )

        let { groups } = match

        return { loaded: true, match, ...groups } 
      } catch(error) {
        return { error, loaded: false}
      }

    },

  }

</script>