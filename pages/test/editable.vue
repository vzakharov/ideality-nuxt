<template>
  <div class="p-3">
    <div class="m-3 p-3 border">
      <template v-for="item, i in items">
        <b-icon icon="plus-circle" :key="i"
          @click="items.splice(i, 0, { content:'' }); items=[...items]"
        />
        <span class="p-1" :key="JSON.stringify(item)"
          contenteditable 
          v-text="item.content"
          @input="currentContent=$event.target.innerText.replace(/\n/g, '')"
          @focus="currentContent=item.content"
          @blur="assignReactive(item, { content: currentContent, nudged: new Date() })"
        />
      </template>
    </div>
    <pre class="mt-2" v-html="JSON.stringify($data, null, 2)"/>
  </div>
</template>

<script>

  export default {

    data() {
      return {
        items: [{content: 'Hello **world**!'}],
        currentContent: ''
      }
    }

  }

</script>

<style>

</style>