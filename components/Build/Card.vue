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
          <h5>
            <nuxt-link 
              class="nocolor"
              v-text="build.name"
              :to="{hash: '#' + build.slug}"
            />
          </h5>
        </template>
        <template #footer>
          <div class="d-flex justify-content-between align-items-center">
            <nuxt-link class="small text-muted font-italic"
              :to="{name:'i-slug', params: build}" target="_blank"
              v-text="new Date(build.createdDate).toDateString()"
            />
            <div>
              <a href="#" class="nocolor"
                @click.prevent="toggleStarred"
                v-text="local.starred ? '⭐' : '☆'"
              />
              <span v-if="build.starredCount" v-text="build.starredCount"/>
            </div>
          </div>        
        </template>
        <p v-text="build.code.blocks[0].content.input"/>
      </b-card>
    </b-col>
</template>

<script>

  export default {

    props: ['build', 'active', 'bookmarkedOnly'],

    data() {
      return {
        local: {}
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
        let bookmarked = local.starred || local.accessRequested || local.secret
        return bookmarked
      }

    },

    methods: {

      toggleStarred() {
        let { $axios, build, local, local: { starred } } = this
        build.starredCount = build.starredCount + ( starred ? -1 : 1 )
        $axios.post('/api/build/starred', { build, clear: starred }).then(({ data }) => this.setFieldsFor(this.build, this.log(data)))
        this.$set(local, 'starred', !starred)
      }

    }

  }

</script>

<style>

</style>