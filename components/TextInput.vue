<template>
  <div class="form-group my-2">
    <label v-if="caption" v-text="caption" class="my-1"/><br/>
    <b-dropdown v-if="choices" variant="outline-secondary" :text="upperFirst(object[_key]) || 'Please choose'">
      <b-dropdown-item 
        v-for="choice in choices" :key="choice" 
        :active="choice==object[_key]"
        @click="$set(object, _key, choice)"
      >
        {{ upperFirst(choice) }}
      </b-dropdown-item>
    </b-dropdown>
    <template v-else>
      <template v-if="multiline">
        <textarea-autosize v-if="valueSet" type="text" v-bind="inputProps"
          @input="$emit('input', $event)"
        />
        <textarea-autosize v-else type="text" v-model="object[_key]"
          v-bind="inputProps"
        />
      </template>
      <template v-else>
        <input v-if="valueSet" v-bind="inputProps" @input="$emit('input', $event.target.value)"/>
        <input v-else v-bind="inputProps" v-model="object[_key]"/>
      </template>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import TextareaAutosize from 'vue-textarea-autosize'

Vue.use(TextareaAutosize)

import { upperFirst } from 'lodash'

export default {

  
  props: [
    'caption', 'placeholder', 'object', '_key', 'multiline', 'labelClass', 'id', 'disabled', 'choices', 'value'
  ],
  
  data() { return {
    valueSet: typeof this.value !=='undefined'
  }},

  computed: {

    // _id() {
      
    //   if (!this.id && !this.caption)
    //     throw({vm: this, message: 'Specify either an id or a caption'})

    //   return 'input-' + (this.id || this.caption).toLowerCase().replace(/[\W]/g, '-')
    // },

    inputProps() {
      let { object, _key, placeholder, disabled, value } = this
      return {
        class: 'form-control w-100',
        // 'v-model': object[_key],
        placeholder,
        disabled,
        value
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

  methods: {
    upperFirst
  }
}

</script>