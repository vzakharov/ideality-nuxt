<template>
  <b-card class="m-2"
    footer-class="small text-muted"
    v-bind="{...active && {
      'border-variant': 'dark'
    }}"
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
            @click.prevent="toggleStar(build)"
            v-text="build.secret ? '⚙️' : build.accessRequested ? '🔔' : build.starred ? '⭐' : '☆'"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="small text-muted font-italic"
        v-text="new Date(build.createdDate).toDateString()"
      /> 
    </template>
    <p v-text="log(build).core"/>
  </b-card>
</template>

<script>

  export default {

    props: ['build', 'active'],

    data() {
      return {
        local: null
      }
    },

    mounted() {
      // let { slug } = this
      // this.syncLocal('builds', {
      //   where: { slug }
      // })
    }

  }

</script>

<style>

</style>