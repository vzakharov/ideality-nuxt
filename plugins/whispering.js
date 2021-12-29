import { find, reject, shuffle, sumBy, upperFirst, without } from 'lodash'
import { filteredParameters } from './helpers'
import axios from 'axios'


function buildPrompt({ setup, slate, tie, duringSetup, exampleIndex, input, appendInput, output }) {
  let { parameterValues, examples } = setup
  let { instruction, omitExamples } = { ...slate, ...tie }
  let { parameters } = slate
  input = input || ''
  output = output || ''

  let prefix = {}

  for (let useAs of ['input', 'output']) {
    let parameter = find(parameters, { useAs })
    if (parameter)
      prefix[useAs] = upperFirst(parameterValues[parameter.name].replace(/^(an?|the) /, ''))//.toUpperCase()
    else if (slate[useAs + 'Prefix'])
      prefix[useAs] = slate[useAs + 'Prefix']
    else
      upperFirst(useAs)
  }

  // console.log({prefix})
  if (duringSetup) {
    examples = without(examples, examples[exampleIndex])
  }

  examples = shuffle(examples)

  let minExampleCount = 2
  if ( examples.length > minExampleCount ) {
    let size = example => example.input.length + example.output.length
    let examplesChars = sumBy(examples.slice(0, minExampleCount), size )
    let i
    for ( i = minExampleCount; i < examples.length && examplesChars < 2000; i++ )
      examplesChars += size(examples[i])
    examples = examples.slice(0, i)
  }

  // console.log(setup, slate)
  let prompt = [
    instruction,
    filteredParameters({ setup, slate, onlyRecitals: true, duringGeneration: true }).map(({ name }) => `${name}:\n${parameterValues[name]}`
    ).join('\n\n'),
    (examples || []).map(example => `=== ${prefix.input} ===\n\n${example.input}\n\n=== ${prefix.output} ===\n\n${example.output}`
    ).join('\n\n'),
    `=== ${prefix.input} ===`
  ].filter(a => a).join('\n\n')

  for (let { name } of reject(parameters, { recital: true })) {
    prompt = prompt.replace(`<${name}>`, parameterValues[name])
  }

  if (input)
    prompt += '\n\n' + input

  if (input && !appendInput || output)
    prompt += `\n\n=== ${prefix.output} ===`
  
  if (output)
    prompt += `\n\n${output.trimEnd()}`

  console.log(prompt)

  let stop = [
    '=== ' + prefix.input,
    // '***',
    ...(examples && examples.length) || omitExamples ? [] : ['\n'],
    ...slate.stop || []
  ]
  return { prompt, stop, prefix }
}

function complete({ prompt, engine, temperature, n, stop, apiKey, logprobs }) {
  let headers = {
    Authorization: `Bearer ${apiKey}`
  }
  
  // console.log({temperature})
  engine = engine || 'curie'
  if (typeof temperature === 'undefined') temperature = 0.5

  let payload = {
    prompt,
    temperature,
    max_tokens: 300,
    frequency_penalty: 0,
    presence_penalty: 0.5,
    n,
    logit_bias: {
      // 50256: -100 // end of text
    //   , 8162: 1 // ***
    //   , 1174: 1 // **
    // 198: 1, // new line,
    //  628: 1 // double new line
    //   , 25: 1 // colon
    //   , 13: 1 // period
    //   , 0: 1 // bang
    //   , 30: 1 // question
    //   , 11: 1 // comma
    //   , 26: 1 // semicolon
    },
    stop,
    logprobs
  }


  // Send request
  let request = [
    `https://api.openai.com/v1/engines/${engine}/completions`,
    payload, { headers }
  ]

  // console.log({ request })

  return axios.post(...request)
}

function parseResponse({ input, output, appendInput, prefix, response, n }) {
  input = input || ''
  output = output || ''

  let starting = { input, output }
  function process(choice) {

    let { input, output } = starting

    let { text } = choice

    console.log(text)
    if (input && !appendInput)
      output += text.trimEnd()
    else {
      [input, output] = (input + text).trimEnd().split('=== ' + prefix.output + ' ===').map(s => s.trim())
      if (!output)
        [input] = input.split("\n")
    }

    if (output) {
      output = output.trim()
      // output = output.replace(/\n\n[\s\S]*/, '')
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