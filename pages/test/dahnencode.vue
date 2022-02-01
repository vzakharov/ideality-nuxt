<template>
  <div class="p-4">
    <client-only>
      <Loading v-if="!mounted" message="One second..."/>
      <template v-else>
        <MyInput
          caption="Time"
          v-model="time"
          lazy
        />

        <b-button variant="outline-secondary"
          @click="number=Date.now()"
        >
          Use current time
        </b-button>

        <MyInput
          caption="Number"
          v-model="number"
        />

        <MyInput
          caption="Dahnencode"
          v-model="code"
          disabled
        />

        <Copiable :value="code" class="text-muted btn btn-light small">
          Copy
        </Copiable>

      </template>
    </client-only>
  </div>
</template>

<script>

  import { encode, decode } from 'dahnencode'

  export default {

    data() {
      return {
        number: Date.now(),
        code: null,
        time: null,
        ignoreCodeChange: false
      }
    },

    watch: {

      code(code) {

        if ( this.ignoreCodeChange )
          return this.ignoreCodeChange = false

        this.number = decode(code)

      },

      number: { immediate: true, handler(number) {
        this.code = encode(number)
        this.time = new Date(number)
        this.ignoreCodeChange = true
      } },

      time(time) {

        if ( this.ignoreCodeChange )
          return this.ignoreCodeChange = false  
        
        this.number = Date.parse(time)

      }

    }

  }
</script>

<style>

</style>