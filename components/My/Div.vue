<template>
  <div :style="filler && {
    height: `calc(100vh - ${dimensions.offsetTop}px)`,
    overflow: 'hidden',
    'overflow-y': 'auto'
  }">
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