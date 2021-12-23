<template>
  <b-container fluid>
    <h1 class="fw-bold display-3 text-center mb-5">{{ title }}</h1>
    <BuilderHero v-if="loaded" v-bind="{widget, content: {output: heroContent}}"/>
    <b-col align-self="center" class="text-center mb-5">
      <h2 class="fw-bold display-5 my-5">Benefits</h2>
      <b-row align-h="center">
        <b-col cols="10" lg="3" v-for="benefit in benefits" :key="benefit" v-html="$md.render(benefit)" class="my-2 gy-3 text-center"/>
      </b-row>
    </b-col>
  </b-container>
</template>

<script>

  export default {

    props: ['widget', 'content'],

    data() {
      try {
        let inputMatch = this.content.input.match(
          /(?<title>.*?),.*\n+(?<heroContent>[\s\S]*)$/m
        )

        let outputMatch = this.content.output.match(
          /(Brief.*\n+)?(?<benefits>[\s\S]*)$/m
        )

        console.log({inputMatch, outputMatch})

        let groups = {}
        if (inputMatch) Object.assign(groups, inputMatch.groups)
        if (outputMatch) Object.assign(groups, outputMatch.groups)

        groups.benefits = groups.benefits.split('\n\n')
        console.log({ groups })

        return({ loaded: true, inputMatch, outputMatch, ...groups })
      } catch(error) {
        return {loaded: false, error}
      }


    }

  }

</script>

<style>

</style>