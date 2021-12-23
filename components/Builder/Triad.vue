<template>
  <b-container fluid>
    <b-col align-self="center" class="text-center mb-5">
      <h2 class="display-6" v-text="headline"/>
      <b-row align-h="center">
        <b-col cols="10" lg="3" v-for="section in sections" :key="section" v-html="$md.render(section)" class="my-2 gy-3 text-center lead"/>
      </b-row>
    </b-col>
  </b-container>
</template>

<script>

  export default {

    props: ['widget', 'content'],

    data() {
      try {
        let match = this.content.output.match(
            /## (?<headline>.*)\n*(?<section1>### .*\n+.*)\n*(?<section2>### .*\n+.*)\n*(?<section3>### .*\n+.*)\n*/
        )

        let { groups } = match

        groups.sections = [ groups.section1, groups.section2, groups.section3 ]

        console.log({ groups })

        return({ loaded: true, ...groups })
      } catch(error) {
        return {loaded: false, error}
      }


    }

  }

</script>

<style>

</style>