<template>
    <b-col v-if="!bookmarkedOnly || bookmarked">
      <b-card class="m-2"
        footer-class="small text-muted"
        v-bind="{...active && {
          'border-variant': 'dark'
        }}"
        v-if="!bookmarkedOnly || bookmarked"
      >
        <template #header>
          <div class="d-flex justify-content-between">
            <h5>
              <nuxt-link 
                class="nocolor"
                v-text="build.name"
                :to="{hash: '#' + build.slug}"
              />
            </h5>
            <div>
              <nuxt-link
                :to="{name:'i-slug', params: build}" target="_blank"
                style="opacity: 30%; z-index: 2" class="small"
              >
                🔗
              </nuxt-link>
              <a href="#" class="nocolor"
                @click.prevent="toggleStarred"
                v-text="!local ? '☆' : local.secret ? '⚙️' : local.accessRequested ? '🔔' : local.starred ? '⭐' : '☆'"
              />
            </div>
          </div>
        </template>
        <template #footer>
          <div class="small text-muted font-italic"
            v-text="new Date(build.createdDate).toDateString()"
          /> 
        </template>
        <p v-text="build.core"/>
      </b-card>
    </b-col>
</template>

<script>

  export default {

    props: ['build', 'active', 'bookmarkedOnly'],

    data() {
      return {
        local: null
      }
    },

    mounted() {
      let { slug } = this.build
      this.syncLocal('builds', {
        where: { slug },
        as: 'local'
      })
    },

    computed: {

      bookmarked() {
        let { local } = this
        let bookmarked = local && (
          local.starred || local.accessRequested || local.secret
        )
        return bookmarked
      }

    },

    methods: {

      toggleStarred() {
        let { $axios, build, local, local: { starred } } = this
        $axios.post('/api/build/starred', { build, clear: starred })
        this.$set(local, 'starred', !starred)
      }

    }

  }

</script>

<style>

</style>