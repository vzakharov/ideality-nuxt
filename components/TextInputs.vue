<template>
  <div>
    <TextInput 
      v-for="field in fieldArray" :key="field.key"
      :caption="field.caption" 
      :placeholder="field.placeholder"
      :multiline="field.multiline"
      :object="field.object || object" :_key="field.key"
    />
  </div>
</template>

<script>

// import TextInput from '@/components/TextInput.vue'

export default {
  props: ['object', 'fields'],

  computed: {
    fieldArray() { 
      return Object.getOwnPropertyNames(this.fields).map(key =>
        ({ key, ...this.fields[key] })
      )
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