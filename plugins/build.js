import { find, reject } from 'lodash'
import { filteredParameters } from '../plugins/helpers'
import axios from 'axios'


function buildPrompt({ setup, slate, tie, duringSetup, input, appendInput, output }) {
  let { parameterValues, examples } = setup
  let { instruction, omitExamples } = { ...slate, ...tie }
  let { parameters } = slate
  input = input || ''
  output = output || ''

  let prefix = {}

  for (let useAs of ['input', 'output']) {
    let parameter = find(parameters, { useAs })
    if (parameter)
      prefix[useAs] = parameterValues[parameter.name].replace(/^(an?|the) /, '').toUpperCase()

    else
      prefix[useAs] = slate[useAs + 'Prefix']
  }

  // console.log({prefix})
  if (duringSetup)
    examples.pop()

  // console.log(setup, slate)
  let prompt = [
    instruction,
    filteredParameters({ setup, slate, onlyRecitals: true, duringGeneration: true }).map(({ name }) => `${name}:\n${parameterValues[name]}`
    ).join('\n\n'),
    (examples || []).map(example => `${prefix.input}:\n- ${example.input}\n\n${prefix.output}:\n${example.output}`
    ).join('\n\n'),
    prefix.input + ':\n-'
  ].filter(a => a).join('\n\n')

  for (let { name } of reject(parameters, { recital: true })) {
    prompt = prompt.replace(`<${name}>`, parameterValues[name])
  }

  if (input)
    prompt += ' ' + input

  if (input && !appendInput || output)
    prompt += `\n\n${prefix.output}:\n${output}`

  console.log(prompt)

  let stop = [
    prefix.input + ':',
    ...(examples && examples.length) || omitExamples ? [] : ['\n'],
    ...slate.stop || []
  ]
  return { prompt, stop, prefix }
}

function complete({ prompt, engine, temperature, n, stop, apiKey }) {
  let headers = {
    Authorization: `Bearer ${apiKey}`
  }
  
  engine = engine || 'curie-instruct-beta'
  temperature = temperature || 0.75

  let payload = {
    prompt,
    temperature,
    max_tokens: 200,
    frequency_penalty: 1,
    presence_penalty: 1,
    n,
    stop
  }


  // Send request
  let request = [
    `https://api.openai.com/v1/engines/${engine}/completions`,
    payload, { headers }
  ]

  console.log({ request })

  return axios.post(...request)
}

function parseResponse({ input, output, appendInput, prefix, response, n }) {
  input = input || ''
  output = output || ''

  let starting = { input, output }
  function process(choice) {

    let { input, output } = starting

    let { text } = choice

    // console.log(text)
    if (input && !appendInput)
      output += text.trimEnd()
    else {
      [input, output] = (input + text).trimEnd().split(prefix.output + ':').map(s => s.trim())
      if (!output)
        [input] = input.split("\n")
    }

    if (output) {
      output = output.trim()
      output = output.replace(/\n\n.*/, '')
    }

    return { input, output }

  }

  let { choices } = response.data
  let content = choices.length == 1 ?
    process(choices[0])
    : choices.map(choice => process(choice))
  return content
}

export {
  buildPrompt,
  complete,
  parseResponse
}