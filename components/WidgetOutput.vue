<template>
  <div>
    {{ output }}
  </div>
</template>

<script>
export default {

  props: ['config', 'input'],

  data: () => ({
    output: null
  }),

  async fetch() {
    console.log('Fetching...')
    let response = await this.$axios.$post(
      'https://api.openai.com/v1/engines/curie-instruct-beta/completions',
      {
        prompt: "Hello, I am",
        temperature: 0.5, 
        max_tokens: 150, 
        frequency_penalty: 1,
        presence_penalty: 1,
        n: 1
      },
      {
        headers: {
          Authorization: 'Bearer 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'
        }
      }
    )
    this.output = response.choices[0].text
    console.log(this.output)
  }

}
</script>

<style>

</style>