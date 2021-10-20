<template>
  <div>
    <TextInputs :object="parameter" :fields="{
      name: 'Name',
      type: 'Type'
    }"/>
    <button v-text="'Delete'" class="mx-2 btn btn-outline-danger align-right" 
      @click="$emit('delete')"
    />
    <hr/>
  </div>
</template>

<script>
export default {
  props: ['parameter']
}
</script>

<style>

</style>