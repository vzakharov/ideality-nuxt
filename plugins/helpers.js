import { filter, pick, get, keys } from 'lodash'

function canRunWidget(user = get(this, '$auth.user')) {
  return !user.temporary || user.widgetRuns < 10
}


function parseKids(parent, keys) {
  console.log(parent, keys)
  keys.forEach(key => {
    let kid = parent[key]
    if (kid)
      parent[key] = JSON.parse(kid)
  })
  return parent
}


export {

  canRunWidget,
  parseKids

}