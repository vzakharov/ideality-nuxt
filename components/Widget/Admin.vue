<template>
  <ObjectConfig
    v-bind="{value}"
    :fields="{
      runsLeft: {},
      inToolbox: { type: 'boolean' }
    }"
  />
</template>

<script>

  export default {

    props: ['value']

  }

</script>

<style>

</style>