<template>
  <b-container fluid>
    <Loading v-if="!builds" message="Loading the ideas, hold on a sec..."/>
    <MySidebarred v-else>
      <template #sidebar>
        <b-button variant="light"
          @click="builds=shuffle(builds)"
        >
          🔀
        </b-button>
        <b-tabs class="sticky-top bg-white">
          <b-tab v-for="title in ['My', 'Recent', 'Shuffled']" :key="title"
            v-bind="{title}"
            @click="hash(title.toLowerCase()).set()"
            :active="hash(title.toLowerCase()).state"
          />
        </b-tabs>
        <b-row :cols="build ? 1 : 5">
          <b-col v-for="b in sortedBuilds" :key="b.id">
            <b-card class="m-2"
              footer-class="small text-muted"
              v-bind="{...build == b && {
                'border-variant': 'dark'
              }}"
              :ref="b.slug"
            >
              <template #header>
                <div class="d-flex justify-content-between">
                  <h5 v-text="b.name"/>
                  <nuxt-link 
                    :to="{name:'i-slug', params: b}"
                    style="opacity: 30%; z-index: 2" class="small"
                  >
                    🔗
                  </nuxt-link>
                </div>
              </template>
              <template #footer>
                <div class="small text-muted font-italic"
                  v-text="b.createdDate.toDateString()"
                /> 
              </template>
              <p v-text="b.core"/>
              <nuxt-link 
                :to="{hash: '#' + b.slug}"
                class="stretched-link"
              />
            </b-card>
          </b-col>
        </b-row>
      </template>
      <template #content v-if="build">
        <Build v-bind="{build}"/>
      </template>
    </MySidebarred>
  </b-container>
</template>

<script>

  import { find, map, shuffle } from 'lodash'

  export default {

    // middleware({ redirect }) {
    //   redirect({name: 'i-new'})
    // },

    data() {

      return {
        builds: null,
        localBuilds: []
      }

    },

    async mounted() {
      this.builds = await this.bubble.get('builds', {}, {
        sort_field: 'Created Date',
        descending: true
      })
      this.syncLocal('builds', { as: 'localBuilds' })
    },

    computed: {

      build() {
        let { builds, $route: { hash: slug } } = this
        if (builds && slug ) {
          slug = slug.slice(1)
          return find(builds, { slug })
        }
      },

      sortedBuilds() {
        let { $route: { hash }} = this
        switch(hash) {
          case '#shuffled': return shuffle(this.builds)
          case '#my': 
            let localSlugs = map(this.localBuilds, 'slug')
            return this.builds.filter(({ slug }) => localSlugs.includes(slug))
        }
        return this.builds
      }

    },

    watch: {
      build: {
        immediate: true,
        handler(b) {
          if (b) {
            this.$nextTick(() => {
              let element = this.$refs[b.slug]?.[0]
              if ( element ) {
                element.scrollIntoView()
                document.getElementById('sidebar').scrollBy(0, -20)
                document.getElementById('content').scrollTop = 0
              }
            })
          }
        }
      }
    },

    methods: {

      shuffle

    }

  }
</script>