<template>
  <div>

    <!-- <LabeledInput
      v-for="parameter in filteredParameters"
      :key="parameter.name"
      v-model="setup.parameterValues[parameter.name]"
      :caption="parameter.name"
      :choices="parameter.choices"
    /> -->

    <h4 v-text="'Examples for AI to use'"/>
    <WidgetSetupExamples v-model="setup.examples" v-bind="{config}"/>
  </div>
</template>

<script>

  export default {

    props: ['value', 'config'],

    data() { 
      let setup = this.setDefaults(this.value, {
        parameterValues: {}
      })
      return { 
        setup
      }
    },

    computed: {

      filteredParameters() {
        return this.config.parameters
      }

    }

  }

</script>

<style>

</style>