import format from 'date-fns/format'

function userDateFormat(date) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return format(date, 'dd.MM.yyy')
}

function databaseDateFormat(date) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return format(date, 'MM-dd-yyyy')
}

export { userDateFormat, databaseDateFormat }
