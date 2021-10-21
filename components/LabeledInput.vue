<template>
  <div class="form-group my-2">
    <div v-if="caption && type!='boolean'"><label v-text="caption" class="my-1 fw-bold"/></div>
    <Choices v-if="choices" v-bind="{value, choices}" @input="$emit('input', $event)"/>
    <div v-else-if="type=='boolean'" class="form-check">
      <input class="form-check-input" type="checkbox" 
        v-bind="{checked: value}" 
        @input="console.log( $event.target.checked ); $emit('input', $event.target.checked || undefined)"
      >
      <label class="form-check-label"> {{caption}} </label>
    </div>
    <template v-else>
      <textarea-autosize v-if="multiline" type="text" v-bind="inputProps"
        @input="$emit('input', $event)"
      />
      <input v-else v-bind="inputProps" @input="$emit('input', commaSeparated ? $event.target.value.split(',') : $event.target.value)"/>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import TextareaAutosize from 'vue-textarea-autosize'

Vue.use(TextareaAutosize)

import Choices from './Choices.vue'

export default {
  components: { Choices },

  
  props: [
    'caption', 'placeholder', 'object', '_key', 'multiline', 'labelClass', 'id', 'disabled', 'choices', 'value', 'commaSeparated', 'type'
  ],
  
  data() { return {
  }},

  computed: {

    // _id() {
      
    //   if (!this.id && !this.caption)
    //     throw({vm: this, message: 'Specify either an id or a caption'})

    //   return 'input-' + (this.id || this.caption).toLowerCase().replace(/[\W]/g, '-')
    // },

    inputProps() {
      let { placeholder, disabled, value, commaSeparated, lazy } = this
      return {
        class: 'form-control w-100',
        // 'v-model': object[_key],
        placeholder,
        disabled,
        value : commaSeparated ? ( value || [] ).join(',') : value
      }
    },
    // value() { return this.object[this._key] }
  },

  // watch: {
  //   object: {
  //     deep: true,
  //     immediate: true,
  //     handler(object) {
  //       debugger
  //       this.value = object[this._key]
  //     }
  //   }
  // }

}

</script>