<template>
  <div class="form-group my-2">
    <template v-if="value && blurred && fixAfterBlur">
      <label v-text="$caption" class="my-1 fw-bold"/>
      <p v-text="value" @click="blurred=false; $nextTick(() => { $refs.input.focus(); $refs.input.select() })"/>
    </template>
    <template v-else>
      <div v-if="$caption && !isBoolean"><label :for="uid" v-text="$caption" class="my-1 fw-bold"/></div>

      <MyDropdown v-if="typeof choices !== 'undefined'" v-bind="{value, choices}" @input="$emit('input', $event)"/>

      <div v-else-if="isBoolean" :class="{'form-check': true, 'form-switch': !prop('checkbox')}">
        <input class="form-check-input" type="checkbox" 
          v-bind="{checked: value, disabled}" 
          @input="$emit('input', $event.target.checked)"
          :id="uid"
        >
        <label :for="uid" class="form-check-label"> {{$caption}} </label>
      </div>

      <template v-else>
        <textarea-autosize v-if="prop('multiline')" v-bind="inputProps" :id="uid"
          v-on="{...$listeners,
            input: inputOrChange,
            change: inputOrChange,
            blur
          }"
          @input="$emit('input', $event)"
          ref="input"
        />
        <input v-else v-bind="inputProps" :id="uid"
          v-on="{...$listeners,
            input: inputOrChange,
            change: inputOrChange,
            blur
          }"
          ref="input"
        />
      </template>
      <div v-if="status">
        <Loading v-if="typeof status.ok === 'undefined'" :message="status.message"/>
        <template v-else-if="status.ok">
          ✔️ {{ status.message }}
        </template>
        <template v-else>
          ❌ <span class="text-danger" v-text="status.message"/>
        </template>
      </div>
      <small v-if="description" class="form-text text-muted" v-text="description"/>
    </template>
  </div>
</template>

<script>

  import Vue from 'vue'
  import TextareaAutosize from 'vue-textarea-autosize'
  import { get, upperFirst } from 'lodash'

  Vue.use(TextareaAutosize)

  export default {

    props: [
      'caption', 'description', 'placeholder', 'object', '$key', 'multiline', 'labelClass', 'id', 
      'disabled', 'choices', 'value', 'commaSeparated', 'type', 'removeNewLines', 'rows', 'lazy',
      'props', 'fixAfterBlur', 'status', 'checkbox'
    ],
    
    data() { 
      return {
        blurred: false
      }
    },

    computed: {

      $caption() {
        return this.caption || upperFirst(this.$key)
      },

      isBoolean() {
        return this.type === 'boolean' || typeof this.value === 'boolean'
      },

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
          lazy,
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

      blur() {
        this.blurred = true
      },

      inputElement() {
        window.document.getElementById(this.uid)
      },

      inputOrChange({type, target, value}) {
        if ( !type || !this.prop('lazy') == ( type == 'change' ))
          return
        if ( typeof value == 'undefined')
          ( {value} = target )
        this.$emit('input', this.commaSeparated ? value.split(',') : value)
        this.blur()
      }

    }

  }

</script>