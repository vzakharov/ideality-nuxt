<template>
  <b-container fluid class="p-0">
    <b-row align-v="center" v-for="block, i in build.code.blocks" :key="block.type"
      :class="{
        'bg-light': i == 0,
        'pt-5': i != 0,
        'vh': i == 0
      }"
    >
      <b-col>
        <Block 
          v-bind="block"
        />
      </b-col>
    </b-row>
    <div v-if="!prop('hidePowered')" style="position: absolute; bottom: 10px; right: 10px">
      <PoweredByIdeality target="12l" class="d-none d-md-block"/>
    </div>
    <BlockWaitlist v-bind="{build}"/>
    <b-row style="height:10vh"/>
  </b-container>
</template>

<script>
  export default {

    props: ['build', 'hidePowered'],

    mounted() {
      this.store.headerHeight = document.getElementById('header')?.offsetHeight || 0
    }

  }

</script>