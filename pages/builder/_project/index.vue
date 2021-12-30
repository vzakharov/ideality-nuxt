<template>

</template>

<script>
import { appendedTarget } from '~/plugins/helpers'

export default {
  async middleware({ route, redirect }) {
    redirect(appendedTarget({ route, name: 'builder-project-section', params: { section: 'assets' }}))
  }
}
</script>