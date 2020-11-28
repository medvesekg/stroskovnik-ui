import get from 'lodash/get'
import parsers from './parse'
import formats from './format'
import definitions from './definitions'

function parseFormatWrapper(parseFormatFn, parsers, formats) {
  return function(input) {
    return parseFormatFn(input, parsers, formats)
  }
}

function parseFormat(input, { from, to }) {
  const parsed = get(parsers, from)(input)
  return get(formats, to)(parsed)
}

for (const typeName in definitions) {
  const type = definitions[typeName]
  parseFormat[typeName] = {}
  for (const optionName in type) {
    const option = type[optionName]
    if (option.parseFormat) {
      parseFormat[typeName][optionName] = parseFormatWrapper(
        option.parseFormat,
        parsers,
        formats
      )
    }
  }
}

export default parseFormat
