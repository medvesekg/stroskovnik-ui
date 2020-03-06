import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'

export default {
  search(q) {
    return `{
      invoice_items(where: {name: {_ilike: "%${q}%"}}, limit: 5) {
        name
        category_id
        subcategory_id
    }
  }`
  },
  thisMonthSum() {
    const from = startOfMonth(new Date()).toISOString()
    const to = endOfMonth(new Date()).toISOString()

    return `{  
      invoice_items_aggregate(where: {invoice: {date: {_gte: "${from}", _lte: "${to}"}}}) {
        aggregate {
          sum {
            cost
          }
        }
      }
    }`
  },
  recent(limit) {
    return `{
      invoice_items(order_by: {invoice: {date: desc, id: desc}, id: asc}, limit: ${limit}) {
        id
        amount
        category_id
        cost
        invoice_id
        name
        subcategory_id
        invoice {
          date
          shop {
            name
          }
        }
      }
    }`
  }
}
