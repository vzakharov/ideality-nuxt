<template>
  <div>
    <TextInput :multiline="true" v-model="value.prompt" caption="Prompt"/>
    <TextInput :choices="context.parameters"/>
  </div>
</template>

<script>

  export default {

    props: ['value', 'i', 'context'],

    data() { return { 
      ...this.value 
    }}

  }

</script>

<style>

</style>