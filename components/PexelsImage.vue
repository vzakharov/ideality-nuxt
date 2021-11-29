<template>
  <div>
    <template v-if="photo">
      <img :src="photo.src.medium" style="width: 100%;"/>
    </template>
    <!-- <Loading v-else message="Loading image..."/> -->
  </div>
</template>

<script>

  export default {

    props: ['query'],

    data() {
      return {
        photo: null
      }
    },

    async fetch({ $axios, query, $store } = this) {
      let promise = $store.state.imagePromises[query]
      if ( !promise ) {
        let fields = {}
        fields[query] = promise = $axios.post('api/getImage', { query })
        $store.commit('setFields', [ 'imagePromises', fields ])
      }
      let { data: photo } = await promise

      Object.assign(this, { photo })
    }

  }

</script>