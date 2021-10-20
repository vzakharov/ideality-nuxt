<template>
  <div>
    <TextInput 
      v-for="field in fieldArray" 
      :key="field.key"
      v-bind="{
        object,
        ...field,
        _key: field.key
      }"
    />
  </div>
</template>

<script>

// import TextInput from '@/components/TextInput.vue'

export default {
  props: ['object', 'fields'],

  computed: {
    fieldArray() { 
      return Object.getOwnPropertyNames(this.fields).map(key => {
        let value = this.fields[key]
        if ( typeof value === 'string' )
          value = { caption: value }
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