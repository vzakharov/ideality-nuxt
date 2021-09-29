<template>
  <div>
    <textarea-autosize 
      id='input' 
      rows="1" 
      style="min-height: 30px" 
      v-model='node.body' 
      class="form-control" 
    />
    <b-button class="my-2" @click="$emit('action', { node, action: 'split'})">
      Split
    </b-button>
  </div>
</template>

<script>
export default {
  props: ['node']
}
</script>