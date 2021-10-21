<template>
  <div>
    <LabeledInput 
      v-for="field in fieldArray.filter(f=>!f.hide)" 
      :key="field.key"
      v-bind="field"
      v-model="vm[field.key]"
    />
  </div>
</template>

<script>

// import LabeledInput from '@/components/LabeledInput.vue'

export default {
  props: ['fields', 'value'],

  data() { return this.value || {}},

  computed: {
    fieldArray() { 
      console.log(this.vm)
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