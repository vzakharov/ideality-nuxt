<template>
  <b-modal id="waitlist" hide-header hide-footer>
    <h2 class="display-6">
      Thank you for your interest!
    </h2>
    <p class="lead">
      We are not yet available publicly — send us a shoutout on Twitter to request beta access!
    </p>
    <b-button size="lg" variant="primary" v-text="'Request access'"
      href="https://twitter.com/intent/tweet?text=@vovahimself great idea with Ideality! Can I join the beta pls?"
      target="_blank"
    />
  </b-modal>
</template>

<script>
export default {

}
</script>

<style>

</style>