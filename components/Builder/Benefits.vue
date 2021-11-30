<template>
  <b-container fluid>
    <BuilderHero v-if="inputMatch" v-bind="{widget, content: {output: heroContent}}"/>
    <b-col align-self="center" class="text-center">
      <h2 class="display-5 my-5">Benefits</h2>
      <b-row>
        <b-col cols="12" lg="4" v-for="benefit in benefits" :key="benefit" v-html="$md.render(benefit)" class="my-2 gy-3 text-center"/>
      </b-row>
    </b-col>
  </b-container>
</template>

<script>

  export default {

    props: ['widget', 'content'],

    data() {
      let inputMatch = this.content.input.match(
        /.*\n+(?<heroContent>[\s\S]*)$/m
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

      return({ inputMatch, outputMatch, ...groups })

    }

  }

</script>

<style>

</style>