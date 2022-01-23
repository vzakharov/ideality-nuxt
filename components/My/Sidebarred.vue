<template>
  <div>
    <b-row ref="container">
      <b-col id="sidebar" :cols="$slots.content ? narrow ? 9 : 3 : 12"
        v-show="!$slots.content || expanded"
        :class="{
          scrollable: expanded,
          shadow: narrow
        }"
        :style="narrow && { position: 'absolute', top: $refs.container && ( $refs.container.offsetTop + 'px' )}"
      >
        <slot name="sidebar"/>
      </b-col>
      <b-col id="content" v-if="$slots.content" :class="{ scrollable: expanded }">
        <slot name="content"/>
      </b-col>
    </b-row>
  </div>
</template>

<script>

  export default {

    props: ['expanded'],

    // watch: {
    //   narrow: { immediate: true, handler(narrow) {
    //     this.$emit('setFields', { expanded: !narrow })
    //   }}
    // }

  }

</script>

<style>

  #sidebar {
    background-color: white
  }

</style>