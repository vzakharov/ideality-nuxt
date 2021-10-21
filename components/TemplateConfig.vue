<template>
  <div>

    <!-- Basic settings (to be deleted probably) -->

    <ObjectConfig v-model="vm" :fields="{
      apiKey: { caption: 'API key', placeholder: 'sk-...' },
      instruction: { caption: 'Instruction for AI', placeholder: 'e.g. “Suggest uses for a product based on a product description and user personas”', multiline: true},
      inputPrefix: { caption: 'Prefix for input' },
      outputPrefix: { caption: 'Prefix for output' }
    }"/>

    <!-- Prompt parts -->

    <h4 v-text="'Prompt parts'"/>
    
    <ListOfComponents 
      v-model="parts"
      component="PromptPart"
      title="part"
      :defaultItem="{
        prompt: ''
      }"
      :context="{parameters}"
    />

    <!-- Parameters (switch with prompt parts?) -->

    <h4>Parameters</h4>
    
    <ListOfComponents
      v-model="parameters"
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

    data() { return this.value }

  }

</script>

<style>

</style>