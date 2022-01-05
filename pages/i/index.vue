<template>
  <b-container fluid>
    <b-row>
      <b-col :cols="build ? 3 : 12"
        class="scrollable"
      >
        <b-button variant="light"
          @click="builds=shuffle(builds)"
        >
          Shuffle
        </b-button>
        <b-row :cols="build ? 1 : 5">
          <b-col v-for="b in builds" :key="b.id">
            <b-card class="m-2">
              <template #header>
                <div class="d-flex justify-content-between">
                  <nuxt-link :to="{hash: '#' + b.slug}" v-text="b.name"/>
                  <nuxt-link target="_blank" :to="{name:'i-slug', params: b}" style="opacity: 30%" class="small">🔗</nuxt-link>
                </div>
              </template>
              <p v-text="b.core"/>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
      <b-col v-if="build" class="scrollable p-0">
        <Build v-bind="{build}"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  import { find, shuffle } from 'lodash'

  export default {

    // middleware({ redirect }) {
    //   redirect({name: 'i-new'})
    // },

    data() {

      return {
        builds: null
      }

    },

    async mounted() {
      this.builds = await this.bubble.get('builds', {}, {
        sort_field: 'Created Date',
        descending: true
      })
    },

    computed: {
      build({ builds, $route: { hash: slug } } = this) {
        if (builds && slug ) {
          slug = slug.slice(1)
          return find(builds, { slug })
        }
      }
    },

    methods: {

      shuffle

    }

  }
</script>

<style>
  .scrollable {
    height: 100vh;
    overflow: hidden;
    overflow-y: auto;
  }
</style>