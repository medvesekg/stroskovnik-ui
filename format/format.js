import definitions from './definitions'

const formats = {}

for (const typeName in definitions) {
  const type = definitions[typeName]
  formats[typeName] = {}
  for (const optionName in type) {
    const option = type[optionName]
    formats[typeName][optionName] = option.format
  }
}

export default formats
