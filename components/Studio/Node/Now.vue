<template>
  <div>
    <textarea-autosize 
      id='input'
      ref='input'
      rows="1" 
      style="min-height: 30px" 
      v-model='node.body' 
      class="form-control" 
    />
    <b-button class="my-2" @click="emitAction(node)">
      Split
    </b-button>
  </div>
</template>

<script>

export default {
  props: ['node'],
  methods: {

    emitAction(node) {
      this.$emit(
        'action', {
          node,
          action: 'split',
          options: { at: this.$refs.input.$el.selectionStart }
        }
      )
    }

  }
}
</script>