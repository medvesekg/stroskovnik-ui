<template>
  <div>
    <div class="d-flex">
      <v-select
        v-model="searchField"
        :items="[...fields, '*']"
        class="shrink"
        label="Polje za iskanje"
      />
      <v-text-field v-model="options.search" label="Iskanje"></v-text-field>
    </div>

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
import CustomQuery from '@/queries/CustomQuery'
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
      this.itemsQuery = new CustomQuery({
        resource: this.resource,
        fields: this.fields,
        orderBy: this.orderBy,
        search: this.debouncedSearch,
        searchFields: this.searchFields,
        limit: this.options.itemsPerPage,
        offset: (this.options.page - 1) * this.options.itemsPerPage
      })

      return this.itemsQuery.toApollo()
    },

    totalItemCount() {
      this.itemsCountQuery = new CustomQuery({
        resource: this.resource,
        fields: ['aggregate.count'],
        search: this.debouncedSearch,
        searchFields: this.searchFields,
        aggregate: true
      })

      return {
        ...this.itemsCountQuery.toApollo(),
        update: data => data[this.itemsCountQuery.name()].aggregate.count
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
      searchField: '*',
      itemsPerPageOptions: [5, 10, 20, 50],
      query: null,
      itemsQuery: null,
      itemsCountQuery: null
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
    },
    orderBy() {
      return this.options.sortBy[0]
        ? [
            {
              field: this.options.sortBy[0],
              direction: this.options.sortDesc[0] ? 'desc' : 'asc'
            }
          ]
        : null
    },
    searchFields() {
      return this.searchField === '*' ? this.fields : [this.searchField]
    }
  },

  watch: {
    'options.search': {
      handler: function(search) {
        this.updateDebouncedSerach(search)
      }
    },
    'options.page': {
      handler: function(page) {
        this.itemsQuery.offset = this.itemsQuery.limit * (page - 1)
      }
    },
    'options.sortBy': {
      deep: true,
      handler: function() {
        this.itemsQuery.orderBy = this.orderBy
      }
    },
    'options.sortDesc': {
      deep: true,
      handler: function() {
        this.itemsQuery.orderBy = this.orderBy
      }
    },
    'options.itemsPerPage': {
      handler: function(perPage) {
        this.itemsQuery.limit = perPage
        this.itemsQuery.offset = perPage * (this.page - 1)
      }
    },
    debouncedSearch: {
      handler: function(search) {
        this.options.page = 1
        this.itemsQuery.search = search
        this.itemsCountQuery.search = search
      }
    },
    searchField: {
      handler: function(searchField) {
        if (this.options.search) {
          this.options.page = 1
        }
        this.itemsQuery.searchFields = this.searchFields
        this.itemsCountQuery.searchFields = this.searchFields
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
