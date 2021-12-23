<template>
  <b-container fluid>
    <b-col align-self="center" class="text-center mb-5">
      <h2 class="display-6 mb-4" v-text="headline"/>
      <b-row align-h="center">
        <b-col cols="10" lg="3" v-for="section, i in sections" :key="i" class="my-2 gy-3 text-center lead">
          <h5 v-text="section.heading"/>
          <p v-text="section.text"/>
        </b-col>
      </b-row>
    </b-col>
  </b-container>
</template>

<script>

  import renderMixin from '~/plugins/render'
  import dedent from 'dedent-js'

  export default {

    mixins: [ renderMixin ],

    props: ['widget', 'content'],

    data() {

      let pattern = dedent`
        ## %headline

        ### %heading1

        %text1

        ### %heading2

        %text2

        ### %heading3

        %text3
      `

      return { 
        pattern,
          headline: '',
          heading1: '', heading2: '', heading3: '',
          text1: '', text2: '', text3: ''
      }

    },

    computed: {

      sections() {
        return [1,2,3].map(n => ({
          heading: this['heading'+n],
          text: this['text'+n]
        }))
      }
    }

  }

</script>

<style>

</style>