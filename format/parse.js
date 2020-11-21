import definitions from './definitions'

const parsers = {}

for (const typeName in definitions) {
  const type = definitions[typeName]
  parsers[typeName] = {}
  for (const optionName in type) {
    const option = type[optionName]
    parsers[typeName][optionName] = option.parse
  }
}

export default parsers
