<template>
  <div>
    <InputWithLabel :multiline="true" v-model="part.text" caption="Prompt"/>
    <InputWithLabel caption="Include if..." v-model="part.includeIf" :choices="map(context.parameters, 'title')"/>
    <InputWithLabel caption="equals..." v-if="part.includeIf" v-model="part.equals" placeholder="Separate with commas"/>
  </div>
</template>

<script>

  import { map } from 'lodash'

  export default {

    props: ['value', 'i', 'context'],

    data() { return {
      part: this.value 
    }},

    methods: {
      map
    }

  }

</script>

<style>

</style>