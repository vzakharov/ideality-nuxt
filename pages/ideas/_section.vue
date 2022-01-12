<template>
  <b-container fluid>
    <Loading v-if="!builds" message="Loading the ideas, hold on a sec..."/>
    <MySidebarred v-else>
      <template #sidebar>
        <ul class="nav nav-tabs sticky-top bg-white">
          <li class="nav-item"
            v-for="section in ['my', 'recent', 'a-z', 'shuffled']" :key="section"
          >
            <nuxt-link :class="`
                nav-link
                ${section==$route.params.section && 'active'}
              `"
              :to="appendedTarget({params: {section}})" v-text="section"
            />
          </li>
        </ul>
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
                    :to="{name:'i-slug', params: b}" target="_blank"
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
                @click.prevent="build "
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

  import { find, map, shuffle, sortBy } from 'lodash'

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
      let { $store } = this
      let { builds } = $store.state
      if ( !builds ) {
        builds = await this.bubble.get('builds', {}, {
          sort_field: 'Created Date',
          descending: true
        })
        $store.commit('set', { builds })
      }
      Object.assign(this, { builds })
      this.syncLocal('builds', { as: 'localBuilds' })
      this.setBuild(this.$route.hash.slice?.(1))
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
        switch(this.$route.params.section) {
          case 'shuffled': return shuffle(this.builds)
          case 'a-z': return sortBy(this.builds, 'name')
          case 'my': 
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
                document.getElementById('sidebar').scrollBy(0, -50)
                document.getElementById('content').scrollTop = 0
              }
            })
          }
        }
      }
    },

    methods: {

      setBuild(slug) {
        let { builds } = this
        if (builds && slug ) {
          return this.build = find(builds, { slug })
        }
      },
      shuffle

    }

  }
</script>