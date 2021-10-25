<template>
  <b-container class="p-3" style="max-width: 960px" fluid="sm">
    <b-row>
      <b-col cols="3" style="max-width:300px" class="p-2 mx-4">
        <b-list-group>
          <b-list-group-item button v-for="w in widgets" :key="w._id" :active="w==widget" @click="widget=w" v-text="w.display.name"/>
        </b-list-group>
      </b-col>
      <b-col cols="8" fluid="sm" class="bg-white p-2">
        <div v-if="widget">
          <!-- <h3 v-text="widget.display.name"/>
          <small>Here’s how your widget might look like (shadow not included):</small> -->
          <WidgetProper v-bind="{widget}" :key="widget" class="shadow mt-4"/>
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

    asyncData: Bubble.load('widgets', { isSample: true })

  }

</script>

<style>

</style>