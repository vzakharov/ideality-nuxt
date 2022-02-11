<template functional>
  <nuxt-link class="nocolor"
    :to="{hash: '#' + props.node.id }"
    v-text="props.node.text"
  />
</template>