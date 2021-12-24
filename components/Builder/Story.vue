<template>
  <b-row align-h="center" class="text-center">
    <b-col cols="12" lg="8">
      <h2 class="display-6 mb-4" v-text="headline"/>
      <p class="lead" v-html="$md.render(text || '')"/>
    </b-col>
  </b-row>
</template>

<script>

  import dedent from 'dedent-js'
  import renderMixin from '~/plugins/render'

  export default {

    mixins: [ renderMixin ],

    props: ['content', 'size'],

    data() {

      let pattern = dedent`
        ## %headline

        %text
      `

      return { 
        pattern,
        headline: '',
        text: ''
      }

    },

  }

</script>