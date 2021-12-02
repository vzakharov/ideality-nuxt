<template>
  <span style="cursor:pointer" @click.prevent="copy">
    <em v-if="copied" v-text="'Copied' + ( fetch ? `: ${value}` : '!' )"/>
    <Loading v-else-if="copying" message="Copying..."/>
    <slot v-else-if="$slots.default"/>
    <template v-else>
      {{ value }}
    </template>
  </span>
</template>

<script>

  export default {

    props: ["value", "label", "fetch"],

    data() {
      return {
        copying: false,
        copied: false
      }
    },

    methods: {
      async copy() {
        if ( this.fetch ) {
          this.copying = true
          this.value = await this.fetch()
        }
        await this.$copyText(this.value)
        this.copied = true
        this.copying = false
        setTimeout(() => this.copied=false, 1000)
      }
    }

  }

</script>

<style>

</style>