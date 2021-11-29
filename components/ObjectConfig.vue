<template>
  <div>
    <LabeledInput 
      v-for="field in fieldArray.filter(f=>!f.hide && ( typeof object[f.key] !=='undefined' || !f.hideIfUndefined ))" 
      :key="field.key"
      v-bind="{
        ...field,
        $key: field.key,
        value: ( field.object || object )[field.key]
      }"
      @input="input(field, $event)"
    />
  </div>
</template>

<script>

// import LabeledInput from '@/components/LabeledInput.vue'

export default {
  props: ['indirect', 'fields', 'value'],

  data() { 
    // debugger
    return { object: this.value }
  },

  computed: {
    fieldArray() { 
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