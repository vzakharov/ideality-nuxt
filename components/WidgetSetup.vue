<template>
  <div>

    <LabeledInput
      v-for="parameter in filteredParameters(widget)"
      :key="parameter.name"
      v-model="setup.parameterValues[parameter.name]"
      :caption="parameter.name"
      :choices="parameter.choices"
      :multiline="parameter.multiline"
    />

    <h4 v-text="'Examples for AI to use'"/>
    <WidgetSetupExamples v-model="setup.examples" v-bind="{widget}"/>
  </div>
</template>

<script>

  import { find } from 'lodash'
  import { filteredParameters } from '~/plugins/helpers'

  export default {

    props: ['value', 'widget'],

    data() { 
      let setup = this.setDefaults(this.value, {
        parameterValues: {}
      })
      return { 
        setup
      }
    },

    methods: {

      filteredParameters

    }

  }

</script>

<style>

</style>