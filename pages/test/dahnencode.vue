<template>
  <div class="p-4">
    <client-only>
      <Loading v-if="!mounted" message="One second..."/>
      <template v-else>
        <MyInput
          caption="Number"
          v-model="number"
        />
        <p class="small text-muted">
          (As date: {{ new Date(number) }})
        </p>
        <b-button variant="outline-secondary"
          @click="number=Date.now()"
        >
          Use current timestamp
        </b-button>

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
        this.ignoreCodeChange = true
      } }

    }

  }
</script>

<style>

</style>