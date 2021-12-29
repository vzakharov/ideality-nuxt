<template>
  <div>
    <ul class="nav nav-pills">
      <li v-for="(e, i) in examples" :key="i" class="nav-item">
        <a href="#"
          :class="{'nav-link':true, active: i == exampleIndex }"
          v-text="i+1"
          @click.prevent="exampleIndex = i"
        />
      </li>
      <button v-text="'Add'" :class="`mx-2 btn ${examples.length ? 'btn-outline-secondary' : 'btn-primary'}`" 
        @click="
          examples = [...examples, {}]
          exampleIndex = examples.length - 1
        "/>
      <button v-text="'Delete'" class="mx-2 btn btn-outline-danger align-right" 
        @click="del"
      />
    </ul>
    <div v-if="examples.length">
      <WidgetProper
        v-model="examples[exampleIndex]"
        v-bind="{
          widget,
          duringSetup: true,
          exampleIndex
        }"
        :key="exampleIndex"
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
      exampleIndex: 0
    }},

    watch: {
      examples(examples) { Object.assign(this.widget.setup, {examples}) }
    },

    methods: {

      del() {
        this.examples = without(this.examples, this.examples[this.exampleIndex]);
        if ( this.exampleIndex >= this.examples.length )
          this.exampleIndex = this.examples.length - 1
      }

    }

  }

</script>