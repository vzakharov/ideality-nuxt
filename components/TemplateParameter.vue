<template>
  <div>
      <ObjectConfig v-model="parameter" :fields="{
        title: 'Title',
        type: { caption: 'Type', choices: ['text', 'choices'] }
      }"/>
      <InputWithLabel v-if="type=='choices'"
        v-bind="{
          caption: 'Choices',
          placeholder: 'Enter choices separated by commas',
          value: (parameter.choices || []).join()
        }"
        @input="parameter.choices = $event.split(',')"
      />
  </div>
</template>

<script>

  export default {

    props: ['value'],

    data() { return {
      parameter: this.value 
    }}

  }

</script>

<style>

</style>