<!-- Arbitrary builder block !-->
<template>
  <component :is="'Block' + type" v-bind="{content, size}" :key="content"/>
</template>

<script>

  export default {

    props: ['type', 'content', 'size']

  }

</script>

<style>

</style>