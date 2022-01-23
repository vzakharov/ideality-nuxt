<template>
  <div>
    <NavPublic section="Tools" subsection="Builder" :target="{ name: 'ideas-section' }">
      <template #custom-nav v-if="build">
        <MyNavToggle size="sm" :text="build.name" v-model="expanded"/>
        <b-nav-item :to="{ name: 'i-slug', params: build }" link-classes="ps-0">
          ⛶
        </b-nav-item>
      </template>
    </NavPublic>
  <b-container fluid>
    <b-modal size="lg" hide-footer v-model="isRoute({ params: { section: 'about' } }, { params: { section: 'top'} }).state">
      <h2 class="display-6">Turn your ideas into tangible assets</h2>
      <template #modal-title>
        Ideality&nbsp;<span class="fw-bold">Builder</span>
      </template>
    </b-modal>
    <Loading v-if="!builds && !build" message="Loading the ideas, hold on a sec..."/>
    <MySidebarred v-else v-bind="{expanded}" v-on="{setFields}">
      <template #sidebar>
        <ul class="nav nav-tabs bg-white">
          <li class="nav-item"
            v-for="section in keys(tabs)" :key="section"
          >
            <nuxt-link :class="`
                nav-link nocolor grayscale
                ${section==route.params.section && 'active'}
              `"
              :to="{params: {section}}" v-text="tabs[section]"
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
            <BuildCard :key="build.id" :id="'build-'+build.slug" 
              v-bind="{ build, bookmarkedOnly: route.params.section=='bookmarked', active: build==vm.build}"
              @remove="builds=without(builds, build)"
              @routed="expanded = false"
            />
          </template> 
        </b-row>
      </template>
      <template #content v-if="build">
        <Build v-bind="{build}" hide-powered/>
      </template>
    </MySidebarred>
  </b-container>
  </div>
</template>

<script>

  import { filter, find, keys, map, shuffle, sortBy, without } from 'lodash'
  import { appendedTarget } from '~/plugins/helpers'

  const tabs = {
    top: 'top',
    recent: 'recent',
    bookmarked: '🔖',
    'a-z': 'a-z',
    shuffled: '🔀'
  }

  export default {

    // middleware({ redirect, route, route: { params: { section }} }) {
    //   if (!section)
    //     redirect(appendedTarget({route, name: 'ideas-section', params: {section: 'top'}}))
    // },

    key(route) {
      return route.name
    },

    data() {

      return {
        builds: null,
        expanded: null,
        localBuild: null,
        localBuilds: [],
        tabs
      }

    },

    async mounted() {
      this.builds = await this.bubble.get('builds', {
          ...!this.admining && { hidden: false }
        }, {
          sort_field: 'Created Date',
          descending: true
        })
      this.syncLocal('builds', { mergeBy: 'id' })
      window.builds = this.builds
    },

    computed: {

      build() {
        let { builds, $route: { params: { section: slug }} } = this
        if ( !slug || tabs[slug] || slug == 'about' )
          return
        let { build } = this.$store.state
        console.log(build)
        if ( build?.slug == slug )
          return build
        if (builds && slug ) {
          build = find(builds, { slug })
          this.$store.commit('set', { build })
          return build
        }
      },

      sortedBuilds() {
        let { builds, $route: { params: { section }}} = this

        if ( !this.tabs[section] )
          section = 'top'

        if ( section == 'shuffled' )
          builds = shuffle(builds)
        else if ( section != 'recent' )
          builds = sortBy(builds, 'name')

        if ( section == 'top' ) {
          builds = sortBy(builds, b => (-b.starredCount || 0) - b.starred/2)
        }

        return builds
      }

    },

    watch: {

      build: {
        immediate: true,
        handler(b) {
          if (b) {
            this.$nextTick(() => {
              let element = document.getElementById('build-'+b.slug)//this.$refs['build-'+b.slug]?.[0]
              if ( element ) {
                // element.$el.scrollIntoView()
                element.scrollIntoViewIfNeeded()
                console.log(element)
                document.getElementById('sidebar')?.scrollBy(0, -50)
                document.getElementById('content').scrollTop = 0
                window.scrollTo(0, 0)
              }
            })
          }
        }
      },

      builds(builds) {
        console.log({builds})
        if (!builds)
          this.builds = window.builds
          // TODO: Find out why the fuck it keeps disappearing (vue/nuxt bug?)
      }

    },

    methods: {

      fetchBuilds() {

      },
      keys, without

    }

  }
</script>