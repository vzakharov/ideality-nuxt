import { getUser } from '~/plugins/helpers'

export default async function ({ store: { state: { auth: { loggedIn }}}, redirect, route: { fullPath } }) {
  console.log({ loggedIn })
  if ( loggedIn )
    await getUser(...arguments)
  else
    return redirect({name: 'login', query: { then: fullPath }})
}