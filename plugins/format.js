import format from '@/format/format'
import parse from '@/format/parse'
import parseFormat from '@/format/parseFormat'

export default (context, inject) => {
  inject('format', format)
  inject('parse', parse)
  inject('parseFormat', parseFormat)
}
