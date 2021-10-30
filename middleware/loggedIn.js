export default function ({ store: { $auth: { state: { loggedIn }}}, redirect, route: { fullPath } }) {
  if ( !loggedIn )
    return redirect({name: 'login', query: { then: fullPath }})
}