<script>

export default {
 
 middleware: ({ store: { $auth: { loggedIn }}, route, redirect}) =>
  redirect({
    ...route,
    name: loggedIn ? 'widget-id-config' : 'widget-id-embed',
    query: {...route.query, ...!loggedIn && { box: null }}
  })

}

</script>
