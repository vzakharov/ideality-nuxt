<!-- Arbitrary builder block !-->
<template>
  <component :is="'Block' + type" v-bind="{content, size}"/>
</template>

<script>

  export default {

    props: ['type', 'content', 'size']

  }

</script>