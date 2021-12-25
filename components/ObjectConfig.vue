<template>
  <div>
    <LabeledInput 
      v-for="field in fieldArray.filter(f => ( object[f.key] || !f.hide ) && ( typeof object[f.key] !=='undefined' || !f.hideIfUndefined ))" 
      :key="field.key"
      v-bind="{
        ...field,
        $key: field.key,
        value: ( field.object || object )[field.key],
        lazy
      }"
      @input="!prop('lazy') && input(field, $event)"
      @change="prop('lazy') && input(field, $event)"
    />
  </div>
</template>

<script>

import { isArray, upperFirst } from 'lodash'

export default {
  props: ['indirect', 'fields', 'value', 'lazy', 'disabled'],

  data() { 
    // debugger
    return { object: this.value }
  },

  computed: {
    fieldArray({ fields } = this) { 
      if ( isArray(fields) ) {
        return fields.map(key => ({
          key,
          caption: upperFirst(key),
          type: 'string'
        }))
      }
      else 
        return Object.getOwnPropertyNames(this.fields).map(key => {
          let value = this.fields[key]
          if ( typeof value === 'string' ) {
            if ( value === 'boolean' )
              value = { type: 'boolean' }
            else
              value = { caption: value }
          }
          return { key, ...value }
        })
    }
  },

  methods: {
    input(field, value) {
      let { object, key } = { ...this, ...field }
      if (this.hasProp('indirect')) {
        this.$emit('please', () =>
          this.$set(this.value, key, value)
        )
      } else
        this.$set(object, key, value)
      if ( field.handler ) field.handler(value)
    }
  }
}

// const props = defineProps({
//   object: Object,
//   fields: Object
// })

// const fieldArray = computed(
// )

</script>