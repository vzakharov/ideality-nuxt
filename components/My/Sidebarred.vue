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
            shadow: narrow,
            'bg-white': true
          }"
          :style="narrow && { position: 'absolute' }"
        >
          <MyToolbar v-if="toolbars && toolbars.sidebar"
            v-bind="toolbars.sidebar"/>
          <b-row :class="{scrollable: expanded}">
            <slot name="sidebar" />
          </b-row>  
        </b-col>
      </transition>
      <b-col id="content" v-if="$slots.content">
        <MyToolbar v-if="toolbars && toolbars.content"
          v-bind="toolbars.content"
        />
        <b-row :class="{ scrollable: expanded }">
          <slot name="content" />
        </b-row>  
      </b-col>
    </b-row>
  </div>
</template>

<script>

  export default {

    props: ['expanded', 'toolbars'],

    watch: {
      narrow: { immediate: true, handler(narrow) {
        // console.log({narrow})
        this.$emit('setFields', { expanded: !narrow} )
      }}
    },

    computed: {


    }

  }

</script>

<style>

  #sidebar {
    background-color: white;
  }


</style>