<template>
  <b-container class="mt-5" v-bind="{fluid}">
    <Breadcrumbs class="mb-3" v-if="!prop('hideBreadcrumbs')"/>
    <slot/>
  </b-container>
</template>

<script>

  export default {

    props: ['hide-breadcrumbs', 'fluid']
    
  }

</script>