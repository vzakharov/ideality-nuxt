<template>
  <div>

    <MyForm v-model="slate" :fields="{
      apiKey: { caption: 'API key', placeholder: 'sk-...' },
      instruction: { caption: 'AI instruction', placeholder: 'e.g. Suggest ...', multiline: true },
      inputPrefix: { caption: 'Prefix for input' },
      inputPrefixEditable: { caption: 'Can be changed in setup', type: 'boolean' },
      outputPrefix: { caption: 'Prefix for output' },
      outputPrefixEditable: { caption: 'Can be changed in setup', type: 'boolean' },
      multilineInput: { caption: 'Allow multiline input', type: 'boolean'},
      omitExamples: { caption: 'Doesn’t need examples', type: 'boolean'}
    }"/>

    <h4>Parameters</h4>
    
    <MyComponentList
      v-model="slate.parameters"
      :context="{slate}"
      component="WidgetConfigSlateParameter"
      title="parameter"
      :defaultItem="{
        type: 'text'
      }"
    />

  </div>
</template>

<script>


  export default {

    props: ['value', 'widget'],

    data() { 
      return {
        slate: this.setDefaults(this.value, {
          apiKey: '', 
          instruction: '', 
          inputPrefix: 'Input', 
          inputPrefixEditable: false,
          outputPrefix: 'Output',
          outputPrefixEditable: false,
          omitExamples: false
        })
      }
    },

    watch: {
      'slate': {
        deep: true,
        handler(slate) {
          let { 
            parameters, inputPrefix, inputPrefixEditable, outputPrefix, outputPrefixEditable
          } = slate
          this.$set(this.widget, 'tie', {
            parameters,
            ...inputPrefixEditable && { inputPrefix },
            ...outputPrefixEditable && { outputPrefix }
          })
        }
      }
    }

  }

</script>