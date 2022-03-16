<template>
  <div v-if="mounted">
    <MyDropdown v-model="ai.profile" :choices="ai.profiles" caption-key="name"/>
    <template v-if="ai.profile">

      <MyDropdown v-model="ai.provider" :choices="ai.providers" caption-key="name"/>
      <template v-if="ai.provider">

        <MyInput v-for="slug in ai.provider.parameters" :key="slug"
          v-model="ai.profile.values[slug]"
          :caption="ai.parameters[slug].caption"
          :choices="ai.parameters[slug].choices"
          :type="ai.parameters[slug].type"
        />

      </template>

    </template>
  </div>
</template>

<script>

  import { find, map } from 'lodash'
  import { viaIndex } from '~/plugins/helpers.js'

  export default {

    props: ['ai'],

    async mounted() {

    },

    computed: {


    },

    methods: {
      find, map
    }

  }

</script>

<style>

</style>