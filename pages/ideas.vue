<template>
  <div>
    <NavPublic ref="nav" section="Tools" subsection="Builder" :target="{ name: 'ideas' }">
      <template #custom-nav>
        <template v-if="build">
          <MyNavToggle size="sm" :text="build.name" v-model="expanded"/>
          <b-nav-item :to="{ name: 'i-slug', params: build }" link-classes="ps-0">
            ⛶
          </b-nav-item>
        </template>
        <b-nav-form v-else>
          <b-button :to="{name: 'i-new'}" variant="outline-primary">
            Start building
          </b-button>
        </b-nav-form>
      </template>
    </NavPublic>
  <b-container fluid>
    <b-modal size="lg" hide-footer v-model="isRoute({ hash: '#about' }).state">
      <h2 class="display-6">Turn your ideas into tangible assets</h2>
      <template #modal-title>
        Ideality&nbsp;<span class="fw-bold">Builder</span>
      </template>
    </b-modal>
    <Loading v-if="!builds && !build" message="Loading the ideas, hold on a sec..."/>
    <MySidebarred v-else v-bind="{expanded}" v-on="{setFields}">
      <template #sidebar>

        <template v-if="build">
          <b-row cols="4">
          </b-row>
        </template>

        <ul class="nav nav-tabs bg-white">
          <li class="nav-item"
            v-for="section in keys(tabs)" :key="section"
          >
            <nuxt-link :class="{
                'nav-link nocolor grayscale': true,
                active: section==tab
              }"
              :to="{ hash: '#' + section }" v-text="tabs[section]"
              @click.native="if (section=='shuffled') shuffleBuilds()"
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
              v-bind="{ build, bookmarkedOnly: hash=='bookmarked', active: vm.build && build.slug==vm.build.slug}"
              @remove="builds=without(builds, build)"
              @routed="expanded = false"
            />
          </template> 
        </b-row>
      </template>
      <template #content v-if="build">
        <transition name="slide-down">
          <div class="sticky-top" v-show="!expanded">
            <div style="position:absolute" class="mt-2">
              <b-button v-for="item, i in [
                  { icon: 'fullscreen', to: { name: 'i-slug', params: build } },
                  { icon: 'x', to: { name: 'ideas' } }
                ]" 
                :key="i" size="sm" variant="outline-secondary" 
                :to="item.to"
              >
                <b-icon :icon="item.icon"/>
              </b-button>
              
            </div>
            <div style="position:absolute; right: 10px">
              <nuxt-link class="close"
                :to="{ name: 'ideas' }"
              >
                ×
              </nuxt-link>
            </div>
          </div>
        </transition>
        <Build v-bind="{build}" hide-powered/>
      </template>
    </MySidebarred>
  </b-container>
  </div>
</template>

<script>

  import { filter, find, keys, map, remove, shuffle, sortBy, without } from 'lodash'
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
    //     redirect(appendedTarget({route, name: 'ideas', params: {section: 'top'}}))
    // },

    key(route) {
      return route.name
    },

    data() {

      console.log('data', this.$data)

      return {
        builds: null,
        expanded: null,
        localBuild: null,
        localBuilds: [],
        tabs,
        tab: 'top'
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
      // window.builds = this.builds
    },

    computed: {

      build() {
        let { builds, hash: slug  } = this
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
        let { builds, hash: section } = this

        if ( !this.tabs[section] )
          section = 'top'

        if ( section == 'shuffled' )
          this.shuffleBuilds()
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

      mounted(mounted) {
        let { _uid, $data, store } = this
        console.log({ $data, mounted })
        if ( mounted ) {
          this.$store.commit('setFields', ['data', { ...store.data, [_uid]: {...$data} }])
        } else {
          Object.assign(this, store.data[_uid] )
        }
          // TODO: Find out why the fuck it keeps disappearing (vue/nuxt bug?)
      },

      hash(tab) {
        if ( tabs[tab] ) {
          Object.assign(this, { tab })
        }
        
      }

    },

    methods: {

      shuffleBuilds() {
        this.builds = shuffle(this.builds)
      },

      keys, shuffle, without

    }

  }
</script>