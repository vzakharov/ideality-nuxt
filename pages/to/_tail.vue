<script>

  import Bubble from '~/plugins/bubble'

  export default {

    async middleware({ redirect, route: { params: { tail }} }) {
      let { url } = await Bubble.anon.get('shortlink', tail)
      console.log({url})
      redirect('/'+url)
    },

  }

</script>