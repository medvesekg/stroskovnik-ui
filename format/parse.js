import definitions from './definitions'

function parseWrapper(parseFn, parsers) {
  return function(input) {
    return [null, undefined].includes(input) ? null : parseFn(input, parsers)
  }
}

const parsers = {}

for (const typeName in definitions) {
  const type = definitions[typeName]
  parsers[typeName] = {}
  for (const optionName in type) {
    const option = type[optionName]
    if (option.parse) {
      parsers[typeName][optionName] = parseWrapper(option.parse, parsers)
    }
  }
}

export default parsers
