<template>
  <div>
      <ObjectConfig v-model="parameter" :fields="{
        name: { caption: 'Name' },
        type: { caption: 'Type', choices: ['text', 'choices'] },
        placeholder: { hide: parameter.type!='text', caption: 'Placeholder' },
        useAs: { caption: 'Use as', choices: ['input', 'output']},
        multiline: { hide: parameter.type!='text', caption: 'Multiline', type: 'boolean'},
        choices: { hide: parameter.type!='choices', caption: 'Choices', placeholder: 'Comma-separated list', commaSeparated: true},
        recital: { caption: 'Recital', type: 'boolean' },
        requires: { caption: 'Requires', choices: context.slate.parameters.map(p=>p.name) },
        regex: { hide: !parameter.requires, caption: 'To match...', placeholder: 'Regular expression or empty (then requires to be defined)'}
      }"/>
      <!-- <LabeledInput v-if="parameter.type=='choices'"
        v-model="parameter.choices"
        v-bind="{
          caption: 'Choices',
          placeholder: 'Enter choices separated by commas',
          commaSeparated: true
        }"
      /> -->
  </div>
</template>

<script>

  export default {

    props: ['value', 'context'],

    data() {
      let parameter = this.setDefaults(this.value, {
        name: '',
        placeholder: '',
        type: 'text',
        choices: undefined,
        recital: undefined,
        requires: undefined,
        regex: undefined,
        multiline: undefined,
        useAs: undefined
      })
      // debugger
      return { parameter }
    }

  }

</script>

<style>

</style>