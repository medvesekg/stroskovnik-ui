import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'

export default {
  getAll: `{ shops {id, name} }`,

  create(name) {
    return `mutation {
      insert_shops(objects: { name: "${name}"}) {
        returning {
          id
          name
        }
      }
    }`
  },

  mostPopular(month, orderBy) {
    const from = format(startOfMonth(new Date(month)), 'MM-dd-yyyy')
    const to = format(endOfMonth(new Date(month)), 'MM-dd-yyyy')

    return `
    {
      shop_popularity(where: {month: {_gte: "${from}", _lte: "${to}"}}, limit: 5, order_by: {${orderBy}: desc}) {
        id
        items_bought
        month
        name
        times_visited
      }
    }
    `
  }
}
