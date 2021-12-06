<template>
  <b-container class="mt-5">
    <b-row>
      <b-col>
        <CodeInput v-model="code"/>
      </b-col>
      <b-col>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  export default {

    props: ['args'],

    data() {
      return this.args
    }

  }

</script>

<style>

</style>