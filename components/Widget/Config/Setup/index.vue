<template>
  <div>

    <LabeledInput
      v-model="setup.advanced"
      type="boolean"
      caption="Show advanced settings"
    />

    <LabeledInput
      v-for="parameter in filteredParameters(widget)"
      :key="parameter.name"
      v-model="setup.parameterValues[parameter.name]"
      :caption="parameter.name"
      :placeholder="parameter.placeholder"
      :choices="parameter.choices"
      :multiline="parameter.multiline"
    />

    <template v-if="setup.advanced || setup.validationRegex">
      <LabeledInput
        caption="Validation regex (optional)"
        v-model="setup.validationRegex"
        multiline
        :placeholder="`If set and the output doesn’t match the regex, the app will try to re-generate the output (max. 3 times).\n\nNew lines will be automatically replaced with '\\n'.`"
      />
    </template>

    <h4 v-text="'Examples for AI to use'"/>
    <WidgetConfigSetupExamples v-model="setup.examples" v-bind="{widget}"/>
  </div>
</template>

<script>

  import { find } from 'lodash'
  import { filteredParameters } from '@/plugins/helpers'

  export default {

    props: ['value', 'widget'],

    data() { 
      let setup = this.setDefaults(this.value, {
        parameterValues: {},
        validationRegex: null,
        advanced: false
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