<template>
  <div class="form-group my-2">
    <label :id="'label-'+_id" :for="_id" v-text="caption" class="my-1 ideality-label"/><br/>
    <textarea-autosize v-if="multiline" type="text" v-model="object[_key]"
      v-bind="inputProps"
    />
    <input v-else v-bind="inputProps" v-model="object[_key]"/>
  </div>
</template>

<script>
import Vue from 'vue'
import TextareaAutosize from 'vue-textarea-autosize'

Vue.use(TextareaAutosize)


export default {

  
  props: [
    'caption', 'placeholder', 'object', '_key', 'multiline', 'labelClass', 'id', 'disabled'
  ],

  computed: {
    _id() {
      return this.id || ('input-' + this.caption.toLowerCase().replace(/[\W]/g, '-'))
    },
    inputProps() {
      let { object, _key, placeholder, disabled } = this
      return {
        class: 'form-control w-100',
        'v-model': object[_key],
        placeholder,
        disabled
      }
    }
  }
}

</script>