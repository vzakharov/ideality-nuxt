<template>
  <div>
    <ObjectConfig
      v-model="ai"
      :key="ai"
      :fields="{
        apiKey: { caption: 'API key', type: 'password'},
        engine: { choices: ['davinci', 'curie'] },
        temperature: { choices: [0, 0.2, 0.4, 0.6, 0.8] }
      }"
    />
  </div>
</template>

<script>

  export default {

    props: ['value'],

    data() {
      return {
        ai: this.value
      }
    }

  }

</script>

<style>

</style>