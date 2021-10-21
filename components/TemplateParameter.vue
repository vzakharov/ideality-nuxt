<template>
  <div>
      <ObjectConfig v-model="parameter" :fields="{
        title: { caption: 'Title' },
        type: { caption: 'Type', choices: ['text', 'choices'] }
      }"/>
      <LabeledInput v-if="parameter.type=='choices'"
        v-model="parameter.choices"
        v-bind="{
          caption: 'Choices',
          placeholder: 'Enter choices separated by commas',
          commaSeparated: true
        }"
      />
  </div>
</template>

<script>

  export default {

    props: ['value'],

    data() {
      let parameter = this.setDefaults(this.value, {
        title: '',
        type: 'text',
        choices: undefined
      })
      return { parameter }
    }

  }

</script>

<style>

</style>