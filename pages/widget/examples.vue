<template>
  <b-container class="bg-light p-3" style="max-width: 720px" fluid="sm">
    <b-row>
      <b-col style="max-width:300px">
        <b-list-group>
          <b-list-group-item button v-for="w in widgets" :key="w._id" :active="w==widget">
            <div @click.prevent="widget=w" v-text="w.display.name"/>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col cols="8" class="bg-white">
        <div v-if="widget">
          <h3 v-text="widget.display.name"/>
          <WidgetProper v-bind="{widget}"/>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  import Bubble from '@/plugins/bubble'

  export default {

    data() { return {
      widget: null
    }},

    asyncData: Bubble.load('widgets', {isSample: true})

  }

</script>

<style>

</style>