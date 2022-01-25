<template>
  <div>
    <b-row ref="container">
      <transition :name="narrow && $slots.content ? 'slide-right' : ''">
        <b-col id="sidebar" 
          v-bind="{...$slots.content && {
            cols: 9,
            sm: 7,
            md: 3
          }}"
          v-show="!$slots.content || expanded"
          :class="{
            scrollable: expanded,
            shadow: narrow,
            'bg-white': true
          }"
          :style="narrow && { position: 'absolute', top: $refs.container && ( $refs.container.offsetTop + 'px' )}"
        >
          <slot name="sidebar"/>
        </b-col>
      </transition>
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
    background-color: white;
  }


</style>