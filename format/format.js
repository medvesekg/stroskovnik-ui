import definitions from './definitions'

function formatWrapper(formatFn, formats) {
  return function(input) {
    return [null, undefined].includes(input) ? '' : formatFn(input, formats)
  }
}

const formats = {}

for (const typeName in definitions) {
  const type = definitions[typeName]
  formats[typeName] = {}
  for (const optionName in type) {
    const option = type[optionName]
    if (option.format) {
      formats[typeName][optionName] = formatWrapper(option.format, formats)
    }
  }
}

export default formats
