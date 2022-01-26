<template functional>
  <b-button v-if="props.if || typeof props.if === 'undefined'"
    size="sm"
    :variant="props.variant || 'outline-secondary'"
    :to="props.to"
    @click.prevent="props.onclick && props.onclick()"
    onclick="this.blur()"
  >
    <b-icon :icon="props.icon"/>
  </b-button>
</template>