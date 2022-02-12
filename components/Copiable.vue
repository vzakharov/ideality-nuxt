<template>
  <div style="cursor:pointer" @click.prevent="copy">
    <em v-if="copied" v-text="'copied!'"/>
    <Loading v-else-if="copying" message="copying..."/>
    <slot v-else-if="$slots.default"/>
    <template v-else>
      {{ value }}
    </template>
  </div>
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
        // console.log(this.value)
        let { value } = this
        if ( this.fetch ) {
          this.copying = true
          value = await this.fetch()
        }
        await this.$copyText(this.log(value))
        this.copied = true
        this.copying = false
        setTimeout(() => this.copied=false, 1000)
      }
    }

  }

</script>