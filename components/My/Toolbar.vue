<template>
  <b-row class="border-bottom bg-white py-1">
    <b-col>
      <MyNavButton v-for="item in items" 
        :key="item.icon"
        v-bind="item"
      />
      <MyCloseButton v-if="close" v-bind="close"/>
    </b-col>
  </b-row>
</template>

<script>

  import header from '~/plugins/mixins/header'

  export default {

    mixins: [header],

    props: ['close', 'items']

  }

</script>