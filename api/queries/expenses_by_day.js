import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'

export default {
  fromTo(from, to) {
    return `{
      expenses_by_day (order_by: {date: asc}, where: {date: {_gte: "${from}", _lte:"${to}"}}) {
        date
        sum
      }
    }`
  },

  forMonth(month) {
    const from = format(startOfMonth(new Date(month)), 'MM-dd-yyyy')
    const to = format(endOfMonth(new Date(month)), 'MM-dd-yyyy')

    return this.fromTo(from, to)
  }
}
