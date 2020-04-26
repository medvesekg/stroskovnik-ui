<template>
  <div>
    <v-text-field v-model="options.search"></v-text-field>
    <v-data-table
      :headers="headers"
      :items="items"
      :options.sync="options"
      :server-items-length="totalItemCount"
      :loading="$apollo.queries.items.loading"
      :footer-props="{
        'items-per-page-options': itemsPerPageOptions
      }"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import debounce from 'lodash/debounce'

export default {
  props: {
    resource: {
      type: String,
      required: true
    },
    fields: {
      type: Array,
      required: true
    }
  },

  apollo: {
    items() {
      return {
        query: gql`
          query CustomQuery($limit : Int, $offset : Int, $order_by: ${
            this.resource
          }_order_by!, $where : ${this.resource}_bool_exp) {
            ${this.resource}(
              limit: $limit, 
              offset: $offset, 
              order_by: [$order_by]
              where: $where
              ) {
              ${this.fields.join('\n')}
            }
          }
        `,
        variables() {
          let orderBy = {}
          if (this.options.sortBy[0]) {
            orderBy = {
              [this.options.sortBy[0]]: this.options.sortDesc[0]
                ? 'desc'
                : 'asc'
            }
          }
          let where = {}
          if (this.debouncedSearch) {
            where = {
              name: {
                _ilike: `%${this.debouncedSearch}%`
              }
            }
          }

          return {
            limit: this.options.itemsPerPage,
            offset: (this.options.page - 1) * this.options.itemsPerPage,
            order_by: orderBy,
            where: where
          }
        },
        update: data => data[this.resource]
      }
    },
    totalItemCount() {
      return {
        query: gql`
        query CustomQuery($where : ${this.resource}_bool_exp) {
          ${this.resource}_aggregate (where: $where) {
            aggregate {
              count
            }
          }
        }
        `,
        variables() {
          let where = {}
          if (this.debouncedSearch) {
            where = {
              name: {
                _ilike: `%${this.debouncedSearch}%`
              }
            }
          }
          return {
            where
          }
        },
        update: data => data[`${this.resource}_aggregate`].aggregate.count
      }
    }
  },

  data() {
    return {
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
        search: ''
      },
      debouncedSearch: '',
      itemsPerPageOptions: [5, 10, 20, 50]
    }
  },

  computed: {
    headers() {
      return this.fields.map(field => {
        return {
          text: field,
          value: field
        }
      })
    }
  },

  watch: {
    'options.search': {
      handler: function(search) {
        this.options.page = 1
        this.updateDebouncedSerach(search)
      }
    }
  },
  methods: {
    updateDebouncedSerach: debounce(function(search) {
      this.debouncedSearch = search
    }, 400)
  }
}
</script>

<style></style>
