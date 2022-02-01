<script>

  export default {
    functional: true,
    render($, { parent, props }) {
      if ( parent && props ) {
        Object.assign(parent, props)
      }
    }  
  }

</script>