<template>
    <b-dropdown :variant="value ? 'outline-dark' : 'outline-secondary'" 
      :text="upperFirst(maybe(value)[display] || value) || placeholder || 'Please choose'"
    >
      <b-dropdown-item
        :active="!value"
        @click="$emit('input')"
      ><em>None</em></b-dropdown-item>
      <b-dropdown-item 
        v-for="choice in choices" :key="choice[display] || choice" 
        :active="display ? choice[display]==maybe(value)[display] : choice==value"
        @click="$emit('input', choice)"
      >
        {{ upperFirst(choice[display] || choice) }}
      </b-dropdown-item>
    </b-dropdown>
</template>

<script>

import { upperFirst } from 'lodash'

export default {

  props: ['value', 'choices', 'placeholder', 'display'],

  methods: { upperFirst }

}
</script>