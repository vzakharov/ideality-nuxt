<template>
  <b-row>
    <b-col id="sidebar" :cols="$slots.content ? 3 : 12" class="scrollable">
      <slot name="sidebar"/>
    </b-col>
    <b-col id="content" v-if="$slots.content" class="scrollable">
      <div style="position:absolute;right:20px;top:0px;opacity:30%">
        <nuxt-link :to="appendedTarget({ reset: { hash: true }})">
          ✖
        </nuxt-link>
      </div>
      <slot name="content"/>
    </b-col>
  </b-row>
</template>

<script>

  export default {

    watch: {
      '$slots.content': value => {
        console.log(value)
      }
    }
  }

</script>

<style>

</style>