<template functional>
  <b-button v-if="!('if' in props) || props.if"
    size="sm"
    :variant="props.variant || 'outline-secondary'"
    :to="props.to"
    @click.prevent="props.onclick && props.onclick()"
    onclick="this.blur()"
  >
    <b-icon :icon="props.icon"/>
  </b-button>
</template>