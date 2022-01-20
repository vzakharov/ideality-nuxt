<template>
  <b-row>
    <b-navbar toggleable="md" v-if="$slots.content && width < 768">
      <b-button @click="showModal=!showModal" variant="light" size="small" target="nav-collapse">
        <span class="navbar-toggler-icon small"></span>
      </b-button>
    </b-navbar>
    <!-- <b-modal v-model="showModal" no-fade>
      <slot name="sidebar"/>
    </b-modal> -->
    <b-col id="sidebar" :cols="$slots.content ? narrow ? 9 : 3 : 12"
      v-show="!narrow || !$slots.content || showModal"
      :class="{
        scrollable: true,
        shadow: narrow
      }"
      :style="narrow && `position:absolute; top: ${$slots.content ? 50 : 0}px`"
    >
      <slot name="sidebar"/>
    </b-col>
    <b-col id="content" v-if="$slots.content" class="scrollable">
      <div style="position:absolute;right:20px;top:0px;opacity:30%">
        <nuxt-link class="close" :to="appendedTarget({ reset: { hash: true }})">
          ×
        </nuxt-link>
      </div>
      <slot name="content"/>
    </b-col>
  </b-row>
</template>

<script>

  export default {

    data() {
      return {
        showModal: false,
        width: null
      }
    },

    watch: {
      '$route.hash': function(hash) {
        console.log({hash})
        this.showModal = false  
      }
    },

    computed: {
      narrow() {
        return this.width < 768
      }
    }

  }

</script>

<style>

  #sidebar {
    background-color: white
  }

</style>