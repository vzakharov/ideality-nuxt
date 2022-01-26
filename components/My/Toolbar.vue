<template functional>
  <b-row class="border-bottom bg-white py-1">
    <b-col>
      <MyNavButton v-for="item in props.items" 
        :key="item.icon"
        v-bind="item"
      />
      <MyCloseButton v-if="props.close" :onclick="props.close.onclick" :to="props.close.to"/>
    </b-col>
  </b-row>
</template>

<script>

  export default {

    props: ['close', 'items']

  }

</script>