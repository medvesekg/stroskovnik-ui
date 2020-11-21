import format from 'date-fns/format'
import parse from 'date-fns/parse'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import { sl } from 'date-fns/locale'

const defaultDate = new Date(0, 0, 0, 0, 0, 0, 0)

export default {
  date: {
    date: {
      format: date => format(date, 'd. M. yyyy', { locale: sl }),
      parse: string => parse(string, 'd. M. yyyy', defaultDate, { locale: sl })
    },
    dateExt: {
      format: date => format(date, 'd. MMM yyyy', { locale: sl }),
      parse: date => format(date, 'd. MMM', defaultDate, { locale: sl })
    },
    dateTime: {
      format: date => format(date, 'd. M. yyyy h:m:s', { locale: sl }),
      parse: string =>
        parse(string, 'd. M. yyyy h:m:s', defaultDate, { locale: sl })
    },
    month: {
      format: date => format(date, 'MMM yyyy', { locale: sl }),
      parse: string => parse(string, 'MMM yyy', defaultDate, { locale: sl })
    },
    databaseDate: {
      format: date => format(date, 'MM-dd-yyyy', { locale: sl }),
      parse: string => parse(string, 'MM-dd-yyyy', defaultDate, { locale: sl })
    },
    pickerDate: {
      format: date => format(date, 'yyyy-MM-dd', { locale: sl }),
      parse: string => parse(string, 'yyyy-MM-dd', defaultDate, { locale: sl })
    },
    pickerMonth: {
      format: date => format(date, 'yyyy-MM', { locale: sl }),
      parse: string => parse(string, 'yyyy-MM', defaultDate, { locale: sl })
    },
    pickerYear: {
      format: date => format(date, 'yyyy', { locale: sl }),
      parse: string => parse(string, 'yyyy', defaultDate, { locale: sl })
    },
    relative: {
      format: date =>
        formatDistanceToNowStrict(date, { locale: sl, addSuffix: true }),
      parse: string => {
        throw new Error("Can't parse relative date: " + string)
      }
    }
  },
  number: {
    default: {
      format: number => number.toLocaleString('sl-SL'),
      parse: number => Number(number.replace(',', '.'))
    },
    integer: {
      format: '',
      parse: ''
    },
    decimal2: {
      format: '0',
      parse: ''
    },
    percent: {
      format: '',
      parse: ''
    },
    currency: {
      format: '',
      parse: ''
    }
  }
}
