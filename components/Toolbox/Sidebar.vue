<template>
  <div>
    <b-row>
      <b-col col="5">
        <h5>AI settings</h5>
      </b-col>
      <b-col class="text-end">
        <a href="#" style="color:#BBB"
          @click.prevent="$emit('assign', { aiHidden: !aiHidden })"
        >
          <small v-text="aiHidden ? 'Show' : 'Hide'"/>
        </a>
      </b-col>
      <AIConfig v-show="!aiHidden" :value="ai" v-on="$listeners" class="fs-small"/>
    </b-row>
    <hr>
    <b-row>
      <b-col col="5">
        <h5>Tools</h5>
      </b-col>
      <b-col class="text-end">
        <a href="#" style="color:#BBB"
          @click.prevent="$emit('assign', { expanded: expanded.length==categories.length ? [] : [...categories] })"
        >
          <small v-text="expanded.length==categories.length ? 'Collapse all' : 'Expand all'"/>
        </a>
      </b-col>
    </b-row>
    <b-list-group>
      <b-list-group-item v-for="category in categories" :key="category" 
        href="#" class="p-0"
        :style="expanded.includes(category) && 'color:#BBB'"
      >
        <div
          @click="$emit('assign', { expanded: expanded.includes(category) ? without(expanded, category) : [...expanded, category] })"
        >
          {{ expanded.includes(category) ? '▾' : '▸' }}
          {{ category }} tools
        </div>
        <b-list-group v-if="expanded.includes(category)"
          class="ps-2"
        >
          <b-list-group-item variant="light" v-for="w in filter(widgets, {category})" :key="w.id"
            href="#"
            class="fw-bold"
            :active="w == widget"
            v-text="w.name"
            @click.prevent="$emit('assign', { widget: w })"
          />
        </b-list-group>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>

  import { filter, without } from 'lodash'

  export default {

    props: ['categories', 'widgets', 'widget', 'expanded', 'aiHidden', 'ai'],

    methods: {
      filter, without
    }

  }

</script>

<style>


</style>