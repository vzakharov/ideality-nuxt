<script>

  import Bubble from '~/plugins/bubble'

  export default {

    async middleware({ redirect, route: { params: { tail }} }) {
      let { url } = await Bubble.anon.go('unshortlink', { tail })
      redirect('/'+url)
    },

  }

</script>