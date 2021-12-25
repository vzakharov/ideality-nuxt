<template>
  <b-container fluid>
    <b-row align-v="center" v-for="block, i in build.code.blocks" :key="block.componentName"
      :class="{
        'bg-light': i == 0,
        'vh-100': i == 0,
        'pt-5': i != 0
      }"
    >
      <b-col>
        <BuilderComponent 
          v-bind="block"
        />
      </b-col>
    </b-row>
    <div style="position: absolute; bottom: 10px; right: 10px">
      <PoweredByIdeality target="12l" class="d-none d-md-block"/>
    </div>
    <BuilderWaitlist v-bind="{build}"/>
    <b-row style="height:10vh"/>
  </b-container>
</template>

<script>

  import Bubble from '~/plugins/bubble'

  export default {

    asyncData: Bubble.asyncData('build')

  }

</script>

<style>

</style>