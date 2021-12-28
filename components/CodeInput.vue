<template>
  <div>
    <b-textarea
      style="font-family: monospace!important; font-size: smaller; height: 70vh"
      class="text-monospace w-100"
      rows="25"
      v-bind="{value, disabled}"
      @change="$emit('input', $event)"
      lazy
    />
    <b-button size="small" variant="light"
      @click.prevent="download(value, name || 'code', format || 'yaml')"
    >
      Download
    </b-button>
  </div>
</template>

<script>

  export default {

    props: ['value', 'name', 'format', 'disabled']

  }

</script>