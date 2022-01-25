<template>
  <b-button
    v-bind="{
      size: 'sm',
      variant: 'outline-secondary',
      ...item
    }"
    @click.prevent="item.onclick && item.onclick()"
    onclick="this.blur()"
  >
    <b-icon :icon="item.icon"/>
  </b-button>
</template>

<script>

  export default {
    props: ['item']
  }

</script>

<style>

</style>