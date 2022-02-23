<template>
  <div>
    <div contenteditable
      @input="log($event)"
    >
      <span v-for="item, i in items" :key=i v-text="item"
        @click="index=i"
        :class="{ gray: i!=index }"
      />
    </div>
    {{ items }}
  </div>
</template>

<script>
  
  export default {
    data() {
      return {
        items: [
          'Hello',
          ' world',
          '!'
        ],
        index: null
      }
    }
  }

</script>

<style>

</style>