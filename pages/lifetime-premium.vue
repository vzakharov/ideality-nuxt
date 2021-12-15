<script>

  export default {

    async middleware({ redirect, route: { params: { tail }} }) {
      redirect('https://twitter.com/vovahimself/status/1471124823703228421?s=20')
    },

  }

</script>
