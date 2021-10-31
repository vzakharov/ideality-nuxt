<template>
  <FullBox>
    <template v-if="ok">
      ✔️ Email confirmed — we’ll get in touch with you once we can give you beta access. Stay tuned!
    </template>
    <template v-else>
      ❌ Oops, this doesn’t seem to be the correct confirmation code.
    </template>
  </FullBox>
</template>

<script>

  import Bubble from '~/plugins/bubble'

  export default {

    async asyncData({ route: { params: { user, code }}}) {

      let ok = null

      try {
        let response = await Bubble.anon.go('checkConfirmationCode', { user, code })
        console.log(response)
        ok = true
      } catch(err) {
        ok = false
      }

      return { ok }

    }

  }

</script>

<style>

</style>