<template>
    <b-dropdown variant="outline-secondary" :text="upperFirst(value) || 'Please choose'">
      <b-dropdown-item 
        v-for="choice in choices" :key="choice" 
        :active="choice==value"
        @click="$emit('input', choice)"
      >
        {{ upperFirst(choice) }}
      </b-dropdown-item>
    </b-dropdown>
</template>

<script>

import { upperFirst } from 'lodash'

export default {

  props: ['value', 'choices'],

  methods: { upperFirst }

}
</script>

<style>

</style>