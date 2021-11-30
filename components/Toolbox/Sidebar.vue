<template>
  <div>
    <b-row>
      <b-col cols="5">
        <h5>AI settings</h5>
      </b-col>
      <b-col class="text-end">
        <a href="#" style="color:#BBB"
          @click.prevent="$emit('setFields', { aiHidden: !aiHidden })"
        >
          <small v-text="aiHidden ? 'Show' : 'Hide'"/>
        </a>
      </b-col>
      <AIConfig v-show="!aiHidden" :key="ai" :value="ai" v-on="$listeners" class="fs-small"/>
    </b-row>
    <hr>
    <b-row>
      <b-col cols="5">
        <h5>Tools</h5>
      </b-col>
      <b-col class="text-end">
        <a href="#" style="color:#BBB"
          @click.prevent="$emit('setFields', { expanded: expanded.length==categories.length ? [] : [...categories] })"
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
          @click="$emit('setFields', { expanded: expanded.includes(category) ? without(expanded, category) : [...expanded, category] })"
        >
          {{ expanded.includes(category) ? '▾' : '▸' }}
          {{ category }} tools
        </div>
        <b-list-group v-if="expanded.includes(category)"
          class="ps-2"
        > 
          <!-- <a :href="appendedUrl({ params: {slug: 'blabla'}})">Bla</a> -->
          <b-list-group-item variant="light" v-for="w in sortBy(filter(widgets, {category}), 'sortIndex')" :key="w.id"
            :href="appendedUrl({ params: { slug: w.slug }})"
            class="fw-bold"
            :active="w == widget"
            v-text="w.name"
            @click.prevent="pseudoRoute({ params: { slug: w.slug }}); $emit('setFields', { widget: w })"
          />
        </b-list-group>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>

  import { filter, sortBy, without } from 'lodash'

  export default {

    props: ['categories', 'widgets', 'widget', 'expanded', 'aiHidden', 'ai'],

    methods: {
      filter, sortBy, without
    }

  }

</script>

<style>


</style>