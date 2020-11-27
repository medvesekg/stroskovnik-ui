import format from '@/format/format'
import parse from '@/format/parse'
import get from 'lodash/get'

function parseAndFormat(value, { from, to }) {
  if (!value) return null
  const parsed = get(parse, from)(value)
  return get(format, to)(parsed)
}

export default (context, inject) => {
  inject('format', format)
  inject('parse', parse)
  inject('parseAndFormat', parseAndFormat)
}
