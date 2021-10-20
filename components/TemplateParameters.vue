<template>
  <div>
    <TemplateParameter
      v-for="parameter in parameters" :key="parameter.name" 
      v-bind="{parameter}"
      @delete="$emit('delete', { parameter })"
    />
    <button v-text="'Add parameter'" :class="`mx-2 btn ${template.parameters.length ? 'btn-outline-secondary' : 'btn-primary'}`" 
      @click="$emit('add')"
    />
  </div>
</template>

<script>
export default {

  props: ['parameters']

}
</script>

<style>

</style>