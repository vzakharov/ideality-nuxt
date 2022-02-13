<template>
  <MySidebarred v-on="{ setFields }" v-bind="{
    expanded,
    toolbars: {
      sidebar: {
        items: [
          { if: build, icon: 'chevron-double-left', onclick() { expanded = false } },
          { icon: 'file-earmark', to: { name: 'i-new' }, variant: 'outline-primary' }
        ]
      },
      content: {
        close: { to: { name: 'ideas' } },
        items: [
          { if: !expanded, icon: 'chevron-double-right', onclick() { expanded = !expanded } },
          { icon: 'link-45deg', to: { name: 'i-slug', params: build } },
        ] 
      }
    }
  }"
  >
    <template #nav>
      <template v-if="build">
        <MyNavToggle size="sm" :text="build.name" v-model="expanded"/>
      </template>
      <b-nav-form v-else>
        <b-button :to="{name: 'i-new'}" variant="outline-primary">
          Start building
        </b-button>
      </b-nav-form>
    </template>
    <template #sidebar v-if="builds">
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
            v-bind="{ build, bookmarkedOnly: hashRoute=='bookmarked', active: vm.build && build.slug==vm.build.slug}"
            @remove="builds=without(builds, build)"
            @routed="if (narrow) expanded = false"
          />
        </template> 
      </b-row>
    </template>
    <template #content v-if="build">
      <Build v-bind="{build}" hide-powered/>
    </template>
  </MySidebarred>
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

    data() {

      console.log('data', this.$data)

      let { build } = this.$store.state

      return {
        build,
        builds: null,
        expanded: false,
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

      sortedBuilds() {
        let { builds, hashRoute: section } = this

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

      hashRoute(slug) {
        
        if ( tabs[slug] ) {
          Object.assign(this, { tab: slug })
        } else {
          let { builds } = this

          if ( !builds || slug == 'about' )
            return

          let build = find(builds, { slug })
          this.$store.commit('set', { build })
          Object.assign(this, { build })
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