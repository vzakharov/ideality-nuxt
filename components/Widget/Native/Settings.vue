<template>
  <div>
    <ObjectConfig v-bind="{value}"
      indirect v-on="$listeners"
    />
  </div>
</template>

<script>

  export default {

    props: ['value']

  }

</script>

<style>

</style>