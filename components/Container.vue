<template>
  <b-container class="pb-5 mt-5" v-bind="{fluid}">
    <Breadcrumbs v-if="!prop('hideBreadcrumbs')"/>
    <slot/>
  </b-container>
</template>

<script>

  export default {

    props: ['hide-breadcrumbs', 'fluid']
    
  }

</script>

<style>

</style>