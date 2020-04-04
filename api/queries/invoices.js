export default {
  create(invoice) {
    return `mutation {
      insert_invoices(objects: { date: "${invoice.date}", shop_id: ${invoice.shop_id}}) {
        returning {
          id
          date
        }
      }
    }`
  },
  mostExpensive(from, to) {
    return `{
      invoice_sums(where: {invoice: {date: {_gte: "${from}", _lte: "${to}"}}}, limit: 5, order_by: {sum: desc}) {
        invoice_id
        sum
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
