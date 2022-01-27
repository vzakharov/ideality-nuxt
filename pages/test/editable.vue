<template>
  <div class="p-3">
    <span class="p-1"
      v-for="item, i in items" :key="i" 
      v-html="item.content" contenteditable 
      @input="currentContent = $event.target.innerHTML"
      @blur="$set(item, 'content', $event.target.innerHTML)"
    />
    <b-icon icon="plus-circle"
      @click="items = [...items, {}]"
    />
    <p class="mt-2" v-text="items.map(i=>i.content || '').join()"/>
  </div>
</template>

<script>

  export default {

    data() {
      return {
        currentContent: '',
        items: []
      }
    }

  }

</script>

<style>

</style>