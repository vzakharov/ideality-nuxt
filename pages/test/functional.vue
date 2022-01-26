<template>
  <div>
      <!-- <MyNavButton v-for="item in [
      { icon: 'chevron-double-left', to: { name: 'index'} },
      { icon: 'file-earmark', to: { name: 'i-new' }, variant: 'outline-primary' }
    ]" 
        :key="item.icon"
        v-bind="item"
      /> -->
  <TestFunctional v-if="mounted" :items="[
      { icon: 'chevron-double-left', to: { name: 'index'} },
      { icon: 'file-earmark', to: { name: 'i-new' }, variant: 'outline-primary' }
    ]" 
  />
  </div>
</template>

<script>

  export default {

  }

</script>

<style>

</style>