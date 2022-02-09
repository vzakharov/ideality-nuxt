<template>
    <b-col v-if="!bookmarkedOnly || bookmarked">
      <b-card class="m-2"
        footer-class="small text-muted"
        v-bind="{...active && {
          'border-variant': 'dark',
          'header-bg-variant': 'primary',
          'header-text-variant': 'white'
        }}"
        v-if="!bookmarkedOnly || bookmarked"
      >
        <template #header>
          <h5>
            <nuxt-link 
              class="nocolor"
              v-text="build.name"
              :to="{hash: '#' + build.slug}"
              @click.native="$emit('routed')"
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
                v-text="build.starred ? '⭐' : '☆'"
              />
              <span v-if="build.starredCount" v-text="build.starredCount"/>

              <a v-if="build.starred" href="#" :class="{ translucent: !build.accessRequested, grayscale: !build.accessRequested }"
                @click.prevent="accessModal=true"
              >
                🔔
              </a>
              <BlockWaitlist v-if="accessModal" v-model="accessModal" v-bind="{build}"
                message="Leave your email below if you want to stay tuned about this idea."
              />

              <a v-if="admining" href="#" :class="{ translucent: !build.hidden }"
                @click="bubble.patch('build', build, { hidden: !build.hidden }).then(() => $set(build, 'hidden', !build.hidden))"
              >
                🙈
              </a>

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
        accessModal: false
      }
    },

    // mounted() {
    //   let { id } = this.build
    //   this.syncLocal('builds', {
    //     where: { id },
    //     as: 'local'
    //   })
    // },

    computed: {

      bookmarked() {
        let { build } = this
        let bookmarked = build.starred || build.accessRequested || build.secret
        return bookmarked
      }

    },

    methods: {

      toggleStarred() {
        let { $axios, build, build: { starred } } = this
        build.starredCount = build.starredCount + ( starred ? -1 : 1 )
        $axios.post('/api/build/starred', { build, clear: starred }).then(({ data }) => this.assignReactive(this.build, this.log(data)))
        build.starred = !starred
      }

    }

  }

</script>

<style>

</style>