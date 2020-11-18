import definitions from '@/definitions'
import gql from 'graphql-tag'
import merge from 'lodash/merge'

export default class CustomQuery {
  constructor({
    resource,
    fields,
    orderBy,
    search,
    searchFields,
    limit,
    offset,
    aggregate,
    filter
  }) {
    this.resource = resource
    this.fields = fields
    this.orderBy = orderBy
    this.search = search
    this.searchFields = searchFields
    this.limit = limit
    this.offset = offset
    this.aggregate = aggregate
    this.filter = filter
  }

  name() {
    if (this.aggregate) {
      return `${this.resource}_aggregate`
    }
    return this.resource
  }

  fieldsQuery() {
    const fields = this.fields.map(field => {
      return field.split('.')
    })

    let fieldsQuery = ''
    for (const field of fields) {
      fieldsQuery += field[0]
      for (let i = 1; i < field.length; i++) {
        fieldsQuery += '{\n'
        fieldsQuery += field[i]
      }
      for (let i = 1; i < field.length; i++) {
        fieldsQuery += '\n}'
      }
      fieldsQuery += '\n'
    }
    return fieldsQuery
  }

  toGql() {
    return gql`
      query CustomQuery(
        $limit : Int, 
        $offset : Int, 
        $orderBy: ${this.resource}_order_by!, 
        $where : ${this.resource}_bool_exp) 
        {
          ${this.name()}(
            limit: $limit, 
            offset: $offset, 
            order_by: [$orderBy]
            where: $where
          ) 
          {
            ${this.fieldsQuery()}
          }
      }
    `
  }

  toVariables() {
    return {
      limit: this.limit,
      offset: this.offset,
      orderBy: this.orderByVariable(),
      where: this.whereVariable()
    }
  }

  orderByVariable() {
    const orderBy = {}

    if (this.orderBy && this.orderBy[0]) {
      const path = this.orderBy[0].field.split('.')
      const direction = this.orderBy[0].direction

      let pointer = orderBy
      for (let i = 0; i < path.length; i++) {
        const currentField = path[i]
        if (currentField === 'aggregate') continue
        if (i < path.length - 1) {
          pointer[currentField] = {}
        } else {
          pointer[currentField] = direction + '_nulls_last'
        }
        pointer = pointer[currentField]
      }
    }
    return orderBy
  }

  whereVariable() {
    let where = {}
    if (this.search && this.searchFields && this.searchFields.length) {
      const wheres = []
      const searchFields = this.searchFields.map(field => field.split('.'))

      for (const field of searchFields) {
        const finalField = field[field.length - 1]
        let table = this.resource
        for (let i = 0; i < field.length; i++) {
          if (definitions[table][field[i]].table) {
            table = definitions[table][field[i]].table
          }
        }
        const type = definitions[table][finalField].type

        let fragment = {}
        let pointer = fragment
        for (let i = 0; i < field.length; i++) {
          const innerField = field[i]
          if (pointer[innerField] === undefined) {
            pointer[innerField] = {}
          }
          pointer = pointer[innerField]
          if (i === field.length - 1) {
            switch (type) {
              case 'integer':
              case 'bigint':
                if (isNaN(Number(this.search))) {
                  fragment = null
                }
                pointer._eq = parseInt(this.search)
                break
              case 'numeric':
                if (isNaN(Number(this.search))) {
                  fragment = null
                }
                pointer._eq = Number(this.search)
                break
              case 'text':
                pointer._ilike = `%${this.search}%`
                break
              case 'date':
              case 'timestamp with time zone':
                if (new Date(this.search).toString() === 'Invalid Date') {
                  fragment = null
                }
                pointer._eq = new Date(this.search)
                break
              default:
                pointer._eq = this.search
                break
            }
          }
        }
        if (fragment) {
          wheres.push(fragment)
        }
      }

      where = {
        _or: wheres
      }
    }

    return merge(where, this.filter)
  }

  toApollo() {
    return {
      query: this.toGql(),
      variables: this.toVariables.bind(this),
      update: data => data[this.name()]
    }
  }
}
