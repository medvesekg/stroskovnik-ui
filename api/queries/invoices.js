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
  }
}
