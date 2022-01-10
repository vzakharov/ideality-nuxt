<template>
  <b-container class="mt-5" v-bind="{fluid}">
    <Breadcrumbs v-if="!prop('hideBreadcrumbs')"/>
    <slot/>
  </b-container>
</template>

<script>

  export default {

    props: ['hide-breadcrumbs', 'fluid']
    
  }

</script>