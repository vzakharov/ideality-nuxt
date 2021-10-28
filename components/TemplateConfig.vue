<template>
  <div>

    <!-- Basic settings (to be deleted probably) -->

    <ObjectConfig v-model="vm" :fields="{
      apiKey: { caption: 'API key', placeholder: 'sk-...' },
      instruction: { caption: 'AI instruction', placeholder: 'e.g. Suggest ...', multiline: true },
      inputPrefix: { caption: 'Prefix for input' },
      outputPrefix: { caption: 'Prefix for output' },
      multilineInput: { caption: 'Allow multiline input', type: 'boolean'},
      omitExamples: { caption: 'Doesn’t need examples', type: 'boolean'}
    }"/>

    <!-- Prompt parts -->

    <h4 v-text="'Prompt parts'"/>
    
    <!-- <ListOfComponents 
      v-model="parts"
      component="PromptPart"
      title="part"
      :defaultItem="{
        prompt: ''
      }"
      :context="{parameters}"
    /> -->

    <!-- Parameters (switch with prompt parts?) -->

    <h4>Parameters</h4>
    
    <ListOfComponents
      v-model="parameters"
      :context="{template: vm}"
      component="TemplateParameter"
      title="parameter"
      :defaultItem="{
        type: 'text'
      }"
    />

  </div>
</template>

<script>


  export default {

    props: ['value'],

    data() { 
      return this.setDefaults(this.value, {
        apiKey: '', 
        instruction: '', 
        inputPrefix: 'Input', 
        outputPrefix: 'Output',
        omitExamples: false
      })
    }

  }

</script>

<style>

</style>