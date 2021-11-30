<template>
  <component :is="'Builder' + name" v-bind="{content}" :key="content.input + content.output"/>
</template>

<script>

  export default {

    props: ['name', 'content']

  }

</script>

<style>

</style>