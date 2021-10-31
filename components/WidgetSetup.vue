<template>
  <div>

    <LabeledInput
      v-for="parameter in filteredParameters(widget)"
      :key="parameter.name"
      v-model="setup.parameterValues[parameter.name]"
      :caption="parameter.name"
      :placeholder="parameter.placeholder"
      :choices="parameter.choices"
      :multiline="parameter.multiline"
    />

    <!-- <ObjectConfig
      v-if="widget.tie" v-model="widget.tie" :fields="{
        inputPrefix: { caption: 'Input prefix', placeholder: 'Keep it short but relevant', hideIfUndefined: true },
        outputPrefix: { caption: 'Output prefix', placeholder: 'Keep it short but relevant', hideIfUndefined: true }
      }"
    /> -->

    <h4 v-text="'Examples for AI to use'"/>
    <WidgetSetupExamples v-model="setup.examples" v-bind="{widget}"/>
  </div>
</template>

<script>

  import { find } from 'lodash'
  import { filteredParameters } from '@/plugins/helpers'

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