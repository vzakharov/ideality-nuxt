<template>
  <div v-if="mounted">
    <MyDropdown v-model="profile" :choices="profiles" caption-key="name"/>
    <template v-if="profile">

      <MyDropdown v-model="provider" :choices="providers" caption-key="name"/>
      <template v-if="provider">

        <MyInput v-for="slug in provider.parameters" :key="slug"
          v-model="profile.values[slug]"
          :caption="parameters[slug].caption"
          :choices="parameters[slug].choices"
          :type="parameters[slug].type"
        />

      </template>

    </template>
  </div>
</template>

<script>

  import { find, map } from 'lodash'
  import { viaIndex } from '~/plugins/helpers.js'

  export default {

    data() {
      return {
        parameters: null,
        providers: null,
        provider: null,
        profiles: null,
        profile: null
      }
    },

    async mounted() {
      this.syncLocal('ai', { select: ['parameters', 'profiles', 'providers', 'profile', 'provider'], inline: true })

      if (!this.profiles) {
        Object.assign(this, await this.loadSample('ai'))
      }

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