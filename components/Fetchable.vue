<template>
  <span>
    <template v-if="$fetchState.pending" class="m-2">
      Loading... <b-spinner small/> 
    </template>
    <template v-else>
      <slot/>
    </template>
  </span>
</template>

<script>

  export default {

    props: ['promise', 'value'],

    async fetch() {
      this.$emit('input', await this.promise)
    }

  }

</script>

<style>

</style>