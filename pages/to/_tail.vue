<script>

  import Bubble from '~/plugins/bubble'

  export default {

    async middleware({ redirect, route: { params: { tail }} }) {
      let { url } = await Bubble.anon.go('unshortlink', { tail })
      console.log({url})
      redirect('/'+url)
    },

  }

</script>