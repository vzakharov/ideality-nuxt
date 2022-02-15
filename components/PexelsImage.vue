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

  import { sleep } from '~/plugins/helpers'

  export default {

    props: ['query', 'orientation'],

    data() {
      return {
        photo: null,
        promise: null,
        lastTyped: 0
      }
    },

    watch: {
      query: {
        immediate: true,
        async handler(query) {
          
          let { $axios, orientation, $store } = this

          let body = { query, orientation }
          let key = JSON.stringify(body)

          let lastTyped = this.lastTyped = Date.now()
          if ( Date.now() - lastTyped  < 300 ) {
            // console.log({ body, lastTyped })
            await sleep(300)
            // console.log(this.lastTyped, { body, lastTyped })
            if ( this.lastTyped != lastTyped )
              return
          }

          this.promise = $store.state.imagePromises[key]
          if ( !this.promise ) {
            let fields = {}
            fields[key] = this.promise = $axios.post('api/getImage', body)
            $store.commit('setFields', [ 'imagePromises', fields ])
          }
          try {
            let { data: photo } = await this.promise
            this.$emit('loaded', !!photo )

            Object.assign(this, { photo })
          } catch {
            
          }


        }
      }
    }

  }

</script>