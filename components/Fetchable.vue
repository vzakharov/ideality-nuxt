<template>
  <span>
    <template v-if="mounting.pending" class="m-2">
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

    async mounted() {
      this.$emit('input', await this.promise)
    }

  }

</script>