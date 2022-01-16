<template>
  <b-container fluid>
    <Loading v-if="!builds" message="Loading the ideas, hold on a sec..."/>
    <MySidebarred v-else>
      <template #sidebar>
        <ul class="nav nav-tabs sticky-top bg-white">
          <li class="nav-item"
            v-for="section in keys(sections)" :key="section"
          >
            <nuxt-link :class="`
                nav-link nocolor grayscale
                ${section==$route.params.section && 'active'}
              `"
              :to="appendedTarget({params: {section}})" v-text="sections[section]"
            />
          </li>
        </ul>
        <b-row v-bind="{
          ...build ? { cols: 1 } : {
            cols: 1,
            'cols-sm': 2,
            'cols-md': 3,
            'cols-lg': 4,
            'cols-xl': 5
          }
        }">
          <template v-for="build in sortedBuilds">
            <BuildCard :key="build.id" :ref="build.slug" v-bind="{ build, bookmarkedOnly: $route.params.section=='bookmarked', active: build==vm.build}"/>
          </template> 
        </b-row>
      </template>
      <template #content v-if="build">
        <Build v-bind="{build}"/>
      </template>
    </MySidebarred>
  </b-container>
</template>

<script>

  import { filter,find, keys, map, shuffle, sortBy } from 'lodash'

  const sections = {
    recent: 'recent',
    bookmarked: '🔖',
    'a-z': 'a-z',
    shuffled: '🔀'
  }

  export default {

    middleware({ redirect, route: { params: { section }} }) {
      if (!section)
      redirect({name: 'ideas-section', params: {section: 'recent'}})
    },

    data() {

      return {
        builds: null,
        localBuild: null,
        localBuilds: [],
        sections
      }

    },

    async mounted() {
      let { $store } = this
      let builds = $store.state.builds?.map?.(build => ({...build}))
      console.log({builds})
      if ( !builds ) {
        builds = await this.bubble.get('builds', {}, {
          sort_field: 'Created Date',
          descending: true
        })
        $store.commit('set', { builds })
      }
      Object.assign(this, { builds })
      this.syncLocal('builds', { as: 'localBuilds' })
      for ( let local of this.localBuilds ) {
        let build = find(this.builds, { slug: local.slug })
        if ( build ) {
          this.setFieldsFor(build, local)
        }
      }
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
          case 'a-z':
          case 'bookmarked': return sortBy(this.builds, 'name')
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
                element.$el.scrollIntoView?.()
                // console.log({element})
                document.getElementById('sidebar')?.scrollBy(0, -50)
                document.getElementById('content').scrollTop = 0
              }
            })
          }
        }
      }
    },

    methods: {

      getLocalBuild({ slug }) {
        return find(this.localBuilds, { slug })
      },

      setLocalBuild({ slug }, values) {
        let localBuild = this.getLocalBuild({ slug })
        if ( !localBuild ) {
          this.localBuilds = [ ...this.localBuilds, { slug, ...values } ]
        } else {
          this.setFieldsFor(localBuild, values)
        }
      },

      toggleStar({ slug }) {
        let localBuild = this.getLocalBuild({ slug })
        this.setLocalBuild({ slug }, { starred: !localBuild?.starred })
      },

      setBuild(slug) {
        let { builds } = this
        if (builds && slug ) {
          return this.build = find(builds, { slug })
        }
      },

      keys

    }

  }
</script>