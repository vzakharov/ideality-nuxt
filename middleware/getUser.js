export default async function ({ $axios, store: { $auth, $auth: { strategy: { token }, state: { loggedIn }}}, redirect, route: { fullPath } }) {
  if ( loggedIn ) {
    let { data: { user }} = await $axios.get('api/auth/user')
    $auth.setUser(user)
  }
}