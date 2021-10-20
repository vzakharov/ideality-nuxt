<template>
  <div>
    <div v-for="(part,i) in value" :key="i">
      <h5> Part {{ i+1}}</h5>
      <TextInput v-model="part.prompt" caption="Prompt"/>
    </div>
    <button v-text="'Add part'" :class="'mx-2 btn btn-outline-secondary'" 
      @click="add"
    />
  </div>
</template>

<script>

  export default {

    props: ['value'],

    methods: {
      add() {
        // debugger
        let newItem = {
          prompt: ''
        }
        // Object.defineProperty(newItem, 'created', {
        //   value: Date.now()
        // })
        this.$emit('input', [
          ...(
            this.value || []
          ),
          newItem
        ])
      }
    }

  }

</script>

<style>

</style>