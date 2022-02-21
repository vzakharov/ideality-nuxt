<template>
  <div v-if="mounted">
    <MyHeading tag="h5">
      Provider
    </MyHeading>
    <b-tabs card pills v-model="provider_index">
      <b-tab v-for="provider, i in providers" :key="i" :title="provider.name">
        <MyInput :caption="provider.name + ' API key'" v-model="provider.apiKey" type="password"/>
      </b-tab>
    </b-tabs>
    <template v-if="provider">
      <MyHeading tag="h5">
        Profiles
      </MyHeading>
      <b-tabs card pills v-model="profile_index">
        <b-tab v-for="profile, i in profiles" :key="i" :title="profile.name">
          <MyInput v-for="param in provider.parameters" :key="param.name"
            v-model="profile[param.name]"
            :caption="param.name"
            :choices="find(provider.parameters, { name: param.name }).choices"
          />
        </b-tab>
      </b-tabs>
    </template>
  </div>
</template>

<script>

  import { find, map } from 'lodash'
  import { viaIndex } from '~/plugins/helpers.js'

  export default {

    mixins: [
      viaIndex('profile'), viaIndex('provider')
    ],

    async mounted() {
      this.syncLocal('ai', { select: ['profiles', 'providers', 'profile', 'provider'], inline: true })

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