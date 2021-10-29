<template>
  <div>
    <LabeledInput 
      v-for="field in fieldArray.filter(f=>!f.hide)" 
      :key="field.key"
      v-bind="{
        ...field,
        value: ( field.object || object )[field.key]
      }"
      @input="!field.lazy && $set(( field.object || object ), field.key, $event)"
      @change="field.lazy && $set(( field.object || object ), field.key, $event)"
    />
  </div>
</template>

<script>

// import LabeledInput from '@/components/LabeledInput.vue'

export default {
  props: ['fields', 'value'],

  data() { 
    return { object: this.value }
  },

  computed: {
    fieldArray() { 
      return Object.getOwnPropertyNames(this.fields).map(key => {
        let value = this.fields[key]
        if ( typeof value === 'string' ) {
          value = { caption: value }
        }
        return { key, ...value }
      })
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