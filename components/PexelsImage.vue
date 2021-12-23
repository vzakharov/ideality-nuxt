<template>
  <div>
    <template v-if="photo">
        <img :src="photo.src.medium" style="width: 100%; max-width: 400px"/>
        <figcaption class="figure-caption">
          <small>
            <a style="color: #CCC" :href="photo.url" target="_blank">
              Photo: {{ photo.photographer }} / Pexels
            </a>
          </small>
        </figcaption>
    </template>
    <!-- <Loading v-else message="Loading image..."/> -->
  </div>
</template>

<script>

  export default {

    props: ['query', 'orientation'],

    data() {
      return {
        photo: null
      }
    },

    async fetch({ $axios, query, orientation, $store } = this) {
      let body = { query, orientation }
      let key = JSON.stringify(body)
      let promise = $store.state.imagePromises[key]
      if ( !promise ) {
        let fields = {}
        fields[key] = promise = $axios.post('api/getImage', body)
        $store.commit('setFields', [ 'imagePromises', fields ])
      }
      let { data: photo } = await promise

      Object.assign(this, { photo })
    }

  }

</script>