<template>
  <div>
    <Builder :args="$data"/>
  </div>
</template>

<script>

  export default {

    data() {

      return {
        code: "helloworld"
      }

    }

  }

</script>

<style>

</style>