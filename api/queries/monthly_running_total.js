import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'

export default {
  on(date) {
    return `
    {
      monthly_running_total(order_by: {date: desc}, where: {date: { _lte: "${date}" }} limit: 1) {
        sum
      }
    }
    `
  },

  fromTo(from, to) {
    return `{
      monthly_running_total (order_by: {date: asc}, where: {date: {_gte: "${from}", _lte:"${to}"}}) {
        date
        sum
      }
    }`
  },

  forMonth(date) {
    const from = format(startOfMonth(new Date(date)), 'MM-dd-yyyy')
    const to = format(endOfMonth(new Date(date)), 'MM-dd-yyyy')

    return this.fromTo(from, to)
  },

  totalForMonth(month) {
    const monthEnd = format(endOfMonth(new Date(month)), 'MM-dd-yyyy')
    return this.on(monthEnd)
  }
}
