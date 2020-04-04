import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'

export default {
  search(name, shop) {
    return `{
      invoice_items(where: {name: {_ilike: "%${name}%",  } _and: {invoice: { shop: { name: { _eq: "${shop}" }} }}}, limit: 5) {
        name
        category_id
    }
  }`
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

  mostExpensive(from, to) {
    return `
    {
      invoice_items(where: {invoice: {date: {_gte: "${from}", _lte: "${to}"}}}, limit: 5, order_by: {cost: desc}) {
        id
        name
        quantity
        cost
        invoice {
          date
          shop {
            name
          }
        }
        category {
          name
        }
      }
    }
    `
  },
  mostPopular(month, orderBy) {
    const from = format(startOfMonth(new Date(month)), 'MM-dd-yyyy')
    const to = format(endOfMonth(new Date(month)), 'MM-dd-yyyy')

    return `{
      item_popularity(where: {month: {_gte: "${from}", _lte: "${to}"}}, order_by: {${orderBy}: desc}, limit: 5) {
        item_name
        times_bought
        total_quantity
        month
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
