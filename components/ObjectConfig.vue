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
      @input="$set(( field.object || object ), field.key, $event); if ( field.handler ) field.handler($event)"
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