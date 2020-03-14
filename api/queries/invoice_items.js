import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'

export default {
  search(q) {
    return `{
      invoice_items(where: {name: {_ilike: "%${q}%"}}, limit: 5) {
        name
        category_id
    }
  }`
  },
  thisMonthSum() {
    return `
    {
      monthly_running_total(order_by: {date: desc}, limit: 1) {
        sum
      }
    }
    `
  },
  recent(limit) {
    return `{
      invoice_items(order_by: {created_at: desc, id: asc}, limit: ${limit}) {
        id
        quantity
        category_id
        cost
        invoice_id
        name
        invoice {
          date
          shop {
            name
          }
        }
      }
    }`
  },

  lastCost(productName, shopName) {
    return `
    {
      invoice_items(where: {invoice: {shop: {name: {_ilike: "${shopName}"}}}, name: {_ilike: "${productName}"}}, order_by: {invoice: {date: desc_nulls_last}}, limit: 1)
      {
        name
        quantity
        cost
      }
    }
    `
  },

  monthlyRunningTotal() {
    const from = startOfMonth(new Date()).toISOString()
    const to = endOfMonth(new Date()).toISOString()

    return `{
      monthly_running_total (order_by: {date: asc}, where: {date: {_gte: "${from}", _lte:"${to}"}}) {
        date
        sum
      }
    }`
  },

  expensesByDay() {
    const from = startOfMonth(new Date()).toISOString()
    const to = endOfMonth(new Date()).toISOString()

    return `{
      expenses_by_day (order_by: {date: asc}, where: {date: {_gte: "${from}", _lte:"${to}"}}) {
        date
        sum
      }
    }`
  },

  monthlyCostBreakdown() {
    const from = startOfMonth(new Date()).toISOString()
    const to = endOfMonth(new Date()).toISOString()
    return `{
        monthly_expenses_breakdown(where: {month: {_gte: "${from}", _lte: "${to}"}}) {
          category_id
          month
          name
          sum
        }
      }
    `
  },

  monthlyCostBreakdownByShop() {
    const from = startOfMonth(new Date()).toISOString()
    const to = endOfMonth(new Date()).toISOString()
    return `{
        monthly_expenses_breakdown_by_shop(where: {month: {_gte: "${from}", _lte: "${to}"}}) {
          shop_id
          month
          name
          sum
        }
      }
    `
  },

  _createGqlInsertObject(item) {
    return `{
      name: "${item.name || ''}",
      category_id: ${item.category_id},
      cost: ${item.cost},
      invoice_id: ${item.invoice_id},
      quantity: ${item.quantity}
    }`
  },

  create(item) {
    const gql = this._createGqlInsertObject(item)

    return `mutation {
      insert_invoice_items(objects: [${gql}]) {
        affected_rows
      }
    }`
  },

  createMany(items) {
    const objects = items.map(item => {
      return this._createGqlInsertObject(item)
    })

    return `mutation {
        insert_invoice_items(objects: [${objects.join(',')}]) {
          affected_rows
        }
      }`
  },

  delete(id) {
    return `mutation {
      delete_invoice_items(where: {id: {_eq: ${id}}}) {
        affected_rows
      }
    }`
  },

  update(id, item) {
    return `mutation {
      update_invoice_items(where: {id: {_eq: ${id}}},
         _set: {
           quantity: ${item.quantity}, 
           category_id: ${item.category_id}, 
           cost: ${item.cost}, 
           name: "${item.name}", 
           }) {
        affected_rows
      }
    }`
  }
}
