<template>
  <div class="form-group my-2">
    <label v-if="caption" :id="'label-'+_id" :for="_id" v-text="caption" class="my-1 ideality-label"/><br/>
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
      <textarea-autosize v-if="multiline" type="text" v-model="object[_key]"
        v-bind="inputProps"
      />
      <input v-else v-bind="inputProps" v-model="object[_key]"/>
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
    'caption', 'placeholder', 'object', '_key', 'multiline', 'labelClass', 'id', 'disabled', 'choices'
  ],
  
  data() { return {
    value: null
  }},

  computed: {
    _id() {
      return 'input-' + (this.id || this.caption).toLowerCase().replace(/[\W]/g, '-')
    },
    inputProps() {
      let { object, _key, placeholder, disabled } = this
      return {
        class: 'form-control w-100',
        'v-model': object[_key],
        placeholder,
        disabled
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