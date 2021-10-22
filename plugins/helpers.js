import { filter, pick, get, keys } from 'lodash'

function canRunWidget(user = get(this, '$auth.user')) {
  return !user.temporary || user.widgetRuns < 50
}

function filteredParameters({setup, template, duringGeneration}) {
  if ( !template.parameters )
    return
  let { parameterValues } = setup
  return template.parameters.filter(({ name, requires, regex }) => {
    let value = parameterValues[name]
    let requiredParameterValue = parameterValues[requires]
    return (
      value || !duringGeneration
    ) && (
      !requires || ( 
        !regex && requiredParameterValue
      ) || (
        requiredParameterValue && requiredParameterValue.match(new RegExp(regex))
      )
    )
  })  
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
  filteredParameters,
  parseKids

}