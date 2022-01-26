<template>
  <b-row class="border-bottom bg-white py-1 sticky-top" style="z-index:100">
    <b-col>
      <MyNavButton v-for="item in items" 
        :key="item.icon"
        v-bind="item"
      />
      <MyCloseButton v-if="close" v-bind="{close}"/>
    </b-col>
  </b-row>
</template>

<script>

  export default {

    props: ['close', 'items']

  }

</script>