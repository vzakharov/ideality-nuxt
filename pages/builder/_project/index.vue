<template>

</template>

<script>
import { appendRoute } from '~/plugins/helpers'

export default {
  async middleware({ route, redirect }) {
    redirect(appendRoute({ route, name: 'builder-project-section', params: { section: 'assets' }}))
  }
}
</script>

<style>

</style>