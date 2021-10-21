<template>
  <div class="form-group my-2">
    <label v-if="caption" v-text="caption" class="my-1 fw-bold"/><br/>
    <Choices v-if="choices" v-bind="{value, choices}" @input="$emit('input', $event)"/>
    <!-- <b-dropdown v-if="choices" variant="outline-secondary" :text="upperFirst(value) || 'Please choose'">
      <b-dropdown-item 
        v-for="choice in choices" :key="choice" 
        :active="choice==value"
        @click="$emit('input', choice)"
      >
        {{ upperFirst(choice) }}
      </b-dropdown-item>
    </b-dropdown> -->
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
    'caption', 'placeholder', 'object', '_key', 'multiline', 'labelClass', 'id', 'disabled', 'choices', 'value', 'commaSeparated'
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
        // value : commaSeparated ? ( value || [] ).join(',') : value
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