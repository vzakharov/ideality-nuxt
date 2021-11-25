export default function({ redirect, req: { headers: { host }} }) {

  console.log({ host })

  const domains = {
    'localhost:3000': 'ideality',
    'ideality.app': 'ideality',
    'ideality.app': 'ideality',
    'ideality-stage.herokuapp.com': 'ideality',
    'ideality-nuxt.herokuapp.com': 'ideality',
    'dodgy.tips': 'dodgytips',
    'www.dodgy.tips': 'dodgytips'
  }

  let domain = domains[host]

  if ( domain )
   redirect({ name: `e-${domain}` })

}