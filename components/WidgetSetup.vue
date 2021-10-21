<template>
  <div>

    <LabeledInput
      v-for="parameter in filteredParameters"
      :key="parameter.name"
      v-model="setup.parameterValues[parameter.name]"
      :caption="parameter.name"
      :choices="parameter.choices"
    />

    <h4 v-text="'Examples for AI to use'"/>
    <WidgetSetupExamples v-model="setup.examples" v-bind="{config}"/>
  </div>
</template>

<script>

  import { find } from 'lodash'

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
        let { parameterValues } = this.setup
        return this.config.template.parameters.filter(({ requires, regex }) => {
          let value = parameterValues[requires]
          console.log(requires, value, regex)
          return !requires || ( 
            !regex && value
          ) || (
            value && value.match(new RegExp(regex))
          )
        })
      }

    }

  }

</script>

<style>

</style>