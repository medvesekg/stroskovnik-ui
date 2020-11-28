import format from 'date-fns/format'
import parse from 'date-fns/parse'
import parseISO from 'date-fns/parseISO'
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
      format: date => format(date, 'yyyy-MM-dd', { locale: sl }),
      parse: string => parse(string, 'yyyy-MM-dd', defaultDate, { locale: sl }),
      parseFormat: (date, parse, format) =>
        format.date.date(parse.date.databaseDate(date))
    },
    databaseDateTime: {
      format: date =>
        format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXXXX", { locale: sl }),
      parse: date => parseISO(date),
      parseFormat: (date, parse, format) =>
        format.date.dateTime(parse.date.databaseDateTime(date))
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
      format: number =>
        number.toLocaleString('sl-SL', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        }),
      parse: ''
    },
    percent: {
      format: (number, format) => format.number.default(number * 100) + '%',
      parse: ''
    },
    currency: {
      format: number =>
        number.toLocaleString('sl-SL', { style: 'currency', currency: 'EUR' }),
      parse: ''
    }
  }
}
