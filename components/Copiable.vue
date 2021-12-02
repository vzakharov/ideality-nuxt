<template>
  <span style="cursor:pointer" @click.prevent="copy">
    <em v-if="copied">
      copied!
    </em>
    <slot v-else-if="$slots.default"/>
    <template v-else>
      {{ value }}
    </template>
  </span>
</template>

<script>

  export default {

    props: ["value", "label"],

    data() {
      return {
        copied: false
      }
    },

    methods: {
      async copy() {
        await this.$copyText(this.value)
        this.copied = true
        setTimeout(() => this.copied=false, 1000)
      }
    }

  }

</script>

<style>

</style>