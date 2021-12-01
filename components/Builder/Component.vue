<template>
  <component :is="'Builder' + name" v-bind="{content, size}" :key="content.input + content.output"/>
</template>

<script>

  export default {

    props: ['name', 'content', 'size']

  }

</script>

<style>

</style>