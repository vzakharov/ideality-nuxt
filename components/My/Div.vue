<template>
  <div :style="filler && {'--height': `calc(100vh - ${dimensions.top}px)`}" :class="{filler, 'p-0': true}">
    <slot/>
  </div>
</template>

<script>

  import TrackDimensions from '~/plugins/mixins/trackDimensions.js'

  export default {

    props: ['filler'],

    mixins: [ TrackDimensions ]

  }

</script>