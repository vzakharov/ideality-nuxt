<template>
  <b-row align-h="center" class="text-center">
    <b-col cols="12" lg="8">
      <h2 class="fw-bold display-6 mb-3" v-text="headline"/>
      <b-button size="lg" variant="primary" v-text="cta" v-b-modal.waitlist/>
    </b-col>
  </b-row>
</template>

<script>

  import dedent from 'dedent-js'
  import render from '~/plugins/render'

  export default {

    mixins: [ render ],

    props: ['content', 'size'],

    data() {

      let pattern = dedent`
        ## %headline

        \\[%cta\\]
      `

      return {
        pattern,
        headline: '',
        cta: ''
      }

    },

  }

</script>