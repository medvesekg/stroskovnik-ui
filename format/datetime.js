import { sl } from 'date-fns/locale'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import format from 'date-fns/format'

function relativeToNow(date) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return formatDistanceToNowStrict(date, { locale: sl, addSuffix: true })
}

function userDateTimeFormat(date) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return format(date, 'd. M. yyy h:m:s')
}

export { relativeToNow, userDateTimeFormat }
