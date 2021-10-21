<template>
  <div>

    <TextInputs :object="vm" :fields="{
      apiKey: { caption: 'API key', placeholder: 'sk-...' },
      instruction: { caption: 'Instruction for AI', placeholder: 'e.g. “Suggest uses for a product based on a product description and user personas”', multiline: true},
      inputPrefix: { caption: 'Prefix for input' },
      outputPrefix: { caption: 'Prefix for output' }
    }"/>

    <ListOfComponents 
      v-model="parts"
      component="TemplatePart"
      title="part"
      :defaultItem="{
        prompt: ''
      }"
      :context="{parameters}"
    />

    <h4>Parameters</h4>

    <div v-for="parameter in parameters" :key="parameter.name">
      <TextInputs :object="parameter" :fields="{
        title: 'Title',
        type: { caption: 'Type', choices: ['text', 'choices'] }
      }"/>
      <TextInput v-if="parameter.type=='choices'"
        v-bind="{
          caption: 'Choices',
          placeholder: 'Enter choices separated by commas',
          value: (parameter.choices || []).join()
        }"
        @input="parameter.choices = $event.split(',')"
      />
      <button v-text="'Delete parameter'" class="mx-2 btn btn-outline-danger align-right" 
        @click="parameters=without(parameters, parameter)"
      />
      <hr/>
    </div>
    <button v-text="'Add parameter'" :class="'mx-2 btn btn-outline-secondary'" 
      @click="parameters = [...parameters, {}]"
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