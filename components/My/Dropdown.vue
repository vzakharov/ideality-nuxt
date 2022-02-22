<template>
    <b-dropdown :variant="value ? 'outline-dark' : 'outline-secondary'" 
      :text="upperFirst(maybe(value)[captionKey] || value) || placeholder || 'Please choose'"
    >
      <b-dropdown-item
        :active="!value"
        @click="$emit('input')"
      ><em>None</em></b-dropdown-item>
      <b-dropdown-item 
        v-for="choice in choices" :key="choice[captionKey] || choice" 
        :active="captionKey ? choice[captionKey]==maybe(value)[captionKey] : choice==value"
        @click="$emit('input', choice)"
      >
        {{ upperFirst(choice[captionKey] || choice) }}
      </b-dropdown-item>
    </b-dropdown>
</template>

<script>

import { upperFirst } from 'lodash'

export default {

  props: ['value', 'choices', 'placeholder', 'captionKey'],

  methods: { upperFirst }

}
</script>