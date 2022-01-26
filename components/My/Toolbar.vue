<template functional>
  <b-row class="border-bottom bg-white py-1">
    <b-col>
      <slot/>
      <MyCloseButton v-if="props.close" :onclick="props.close.onclick" :to="props.close.to"/>
    </b-col>
  </b-row>
</template>

<script>

  export default {

    props: ['close']

  }

</script>