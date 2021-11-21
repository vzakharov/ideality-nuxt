import { getUser } from '~/plugins/helpers'

export default async function ({ store: { $auth: { state: { loggedIn }}}, redirect, route: { fullPath } }) {
  if ( loggedIn )
    await getUser(...arguments)
  else
    return redirect({name: 'login', query: { then: fullPath }})
}