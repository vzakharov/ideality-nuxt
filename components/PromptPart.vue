<template>
  <div>
    <LabeledInput :multiline="true" v-model="part.text" caption="Prompt"/>
    <LabeledInput caption="Include if..." v-model="part.includeIf" :choices="map(context.parameters, 'title')"/>
    <LabeledInput caption="is one of..." v-if="part.includeIf" v-model="part.isIn" :commaSeparated="true" placeholder="Separate with commas"/>
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