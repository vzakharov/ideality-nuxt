<template>
  <div>
    <ul class="nav nav-pills">
      <li v-for="(e, i) in examples" :key="i" class="nav-item">
        <a href="#"
          :class="{'nav-link':true, active: i == index }"
          v-text="i+1"
          @click.prevent="index = i"
        />
      </li>
      <button v-text="'Add'" :class="`mx-2 btn ${examples.length ? 'btn-outline-secondary' : 'btn-primary'}`" 
        @click="
          examples = [...examples, {}]
          index = examples.length - 1
        "/>
      <button v-text="'Delete'" class="mx-2 btn btn-outline-danger align-right" 
        @click="del"
      />
    </ul>
    <div v-if="examples.length">
      <WidgetProper
        v-model="examples[index]"
        v-bind="{widget}"
        :key="index"
        :duringSetup="true"
      />
    </div>
  </div>
</template>

<script>

  import { first, last, without } from 'lodash'

  export default {

    props: ['value', 'widget'],

    data() { return { 
      examples: this.value,
      index: 0
    }},

    watch: {
      examples(examples) { Object.assign(this.widget.setup, {examples}) }
    },

    methods: {

      del() {
        this.examples = without(this.examples, this.examples[this.index]);
        if ( this.index >= this.examples.length )
          this.index = this.examples.length - 1
      }

    }

  }

</script>

<style>

</style>