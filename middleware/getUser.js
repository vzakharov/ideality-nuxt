export default async function ({ $axios, store: { $auth, $auth: { strategy: { token }, state: { loggedIn }}}, redirect, route: { fullPath } }) {
  if ( loggedIn ) {
    try {
      let { data: { user }} = await $axios.get('api/auth/user')
      $auth.setUser(user)
    } catch(error) {
      console.log({error})
      $auth.setUser(null)
    }
  }
}