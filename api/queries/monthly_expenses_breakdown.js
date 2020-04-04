import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'

export default {
  byCategory(month) {
    const from = format(startOfMonth(new Date(month)), 'MM-dd-yyyy')
    const to = format(endOfMonth(new Date(month)), 'MM-dd-yyyy')
    return `{
        monthly_expenses_breakdown_by_category(where: {month: {_gte: "${from}", _lte: "${to}"}}) {
          category_id
          month
          name
          sum
        }
      }
    `
  },

  byShop(month) {
    const from = format(startOfMonth(new Date(month)), 'MM-dd-yyyy')
    const to = format(endOfMonth(new Date(month)), 'MM-dd-yyyy')
    return `{
        monthly_expenses_breakdown_by_shop(where: {month: {_gte: "${from}", _lte: "${to}"}}) {
          shop_id
          month
          name
          sum
        }
      }
    `
  }
}
