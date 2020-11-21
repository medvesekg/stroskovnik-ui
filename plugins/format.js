import format from '@/format/format'
import parse from '@/format/parse'

export default (context, inject) => {
  inject('format', format)
  inject('parse', parse)
}
