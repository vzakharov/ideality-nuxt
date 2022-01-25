<template functional>
  <b-button
    v-bind="{
      size: 'sm',
      variant: 'outline-secondary',
      ...props.item
    }"
    @click.prevent="props.item.onclick && props.item.onclick()"
    onclick="this.blur()"
  >
    <b-icon :icon="props.item.icon"/>
  </b-button>
</template>

<script>

  export default {
    props: ['item']
  }

</script>

<style>

</style>