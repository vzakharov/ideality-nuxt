<template>
  <a
    :href="appendedUrl(to)"
    @click.prevent=""
  />  
</template>

<script>

  export default {

    props: ['to']

  }

</script>

<style>

</style>