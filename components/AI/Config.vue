<!-- Component to configure AI generation settings -->
<template>
  <div>
    <ObjectConfig
      v-model="ai"
      :key="ai"
      :fields="{
        apiKey: { caption: 'API key', type: 'password'},
        engine: { choices: ['davinci', 'curie'] },
        temperature: { choices: [0, 0.25, 0.5, 0.75] }
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