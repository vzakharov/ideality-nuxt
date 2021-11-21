import { getUser } from '~/plugins/helpers'

export default async function ({ store: { $auth: { state: { loggedIn }}}}) {
  if ( loggedIn )
    await getUser(...arguments)
}