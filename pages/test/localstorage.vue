<template>
  <div class="p-3">
    <template v-if="hashRoute">
      Local storage content for key <strong v-text="hashRoute"/>:
      <CodeInput v-model="content"/>
    </template>
    <Loading v-else message="Please wait..."/>
  </div>
</template>

<script>

  export default {

    computed: {
      content: {
        get() {
          return localStorage.getItem(this.hashRoute)
        },

        set(value) {
          localStorage.setItem(this.hashRoute, value)
        }
      }
    }

  }

</script>

<style>

</style>