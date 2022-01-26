<template functional>
  <div>
    {{ JSON.stringify(props) }}
    <TestFunctional v-if="!props.stop" v-bind="{...props, stop: true}"/>
  </div>
</template>

<script>

  export default {

    props: ['close', 'items', 'stop']

  }

</script>