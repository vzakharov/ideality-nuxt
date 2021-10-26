<template>
  <div class="form-group my-2">
    <div v-if="caption && type!='boolean'"><label :for="uid" v-text="caption" class="my-1 fw-bold"/></div>
    <Choices v-if="choices" v-bind="{value, choices}" @input="$emit('input', $event)"/>
    <div v-else-if="type=='boolean'" class="form-check">
      <input class="form-check-input" type="checkbox" 
        v-bind="{checked: value, disabled}" 
        @input="console.log( $event.target.checked ); $emit('input', $event.target.checked || undefined)"
        :id="uid"
      >
      <label :for="uid" class="form-check-label"> {{caption}} </label>
    </div>
    <template v-else>
      <textarea-autosize v-if="multiline" v-bind="inputProps" :id="uid"
        v-on="{...$listeners,
          input
        }"
        @input="$emit('input', $event)"
        ref="input"
      />
      <input v-else v-bind="inputProps" :id="uid"
        v-on="{...$listeners,
          input
        }"
        ref="input"
      />
    </template>
    <small v-if="description" class="form-text text-muted" v-text="description"/>
  </div>
</template>

<script>
import Vue from 'vue'
import TextareaAutosize from 'vue-textarea-autosize'
import { get } from 'lodash'

Vue.use(TextareaAutosize)

import Choices from './Choices.vue'

export default {
  components: { Choices },

  
  props: [
    'caption', 'description', 'placeholder', 'object', '_key', 'multiline', 'labelClass', 'id', 
    'disabled', 'choices', 'value', 'commaSeparated', 'type', 'removeNewLines', 'rows',
    'props'
  ],
  
  data() { return {
  }},

  computed: {

    uid() {
      return this.id || ( 'input-' + this._uid )
    },

    inputProps() {
      let { placeholder, description, disabled, value, commaSeparated, lazy, removeNewLines, rows, props, type } = this
      if (!type) type='text'
      if ( value ) {
        if ( commaSeparated )
          value = value.join(',')
        if ( removeNewLines )
          value = value.replace(/\n+/g, ' ')
      }
      return {
        class: 'form-control w-100',
        // 'v-model': object[_key],
        placeholder,
        disabled,
        description,
        rows,
        value,
        type,
        ...props
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
    input(event) {
      let value = get(event, 'target.value')
      if ( typeof value === 'undefined' )
        value = event
      this.$emit('input', this.commaSeparated ? value.split(',') : value)
    }
  }

}

</script>