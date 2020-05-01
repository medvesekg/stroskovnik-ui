<template>
  <div>
    <h1 class="text-center">Kategorije</h1>
    <graphql-table
      ref="graphqlTable"
      :fields="[
        'id',
        'name',
        'invoice_items_aggregate.aggregate.count',
        'invoice_items_aggregate.aggregate.sum.total'
      ]"
      :extra-columns="[{ text: 'actions', value: 'actions' }]"
      resource="categories"
    >
      <template #item.actions="{item}">
        <v-btn @click="deleteCategory(item)" color="error" small>
          <v-icon>delete</v-icon>
        </v-btn>
      </template>
    </graphql-table>
    <div class="d-flex align-center">
      <v-text-field v-model="newCategory" label="Nova kategorija">
        <template #append-outer>
          <v-btn @click="addCategory" color="primary">Dodaj</v-btn>
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script>
import GraphqlTable from '@/components/GraphqlTable'
import gql from 'graphql-tag'

export default {
  components: { GraphqlTable },

  data() {
    return {
      newCategory: ''
    }
  },

  methods: {
    addCategory() {
      const newCategory = this.newCategory

      this.newCategory = ''

      this.$apollo
        .mutate({
          mutation: gql`
            mutation InsertCategory($name: String) {
              insert_categories_one(object: { name: $name }) {
                name
                id
              }
            }
          `,

          variables: {
            name: newCategory
          },

          update: () => {
            this.$store.dispatch('snackbar/success', 'Kategorija dodana')
            this.$refs.graphqlTable.reset()
          }
        })
        .catch(() => {
          this.newCategory = newCategory
        })
    },

    deleteCategory(category) {
      this.$apollo.mutate({
        mutation: gql`
          mutation DeleteCategory($id: Int!) {
            delete_categories_by_pk(id: $id) {
              id
            }
          }
        `,

        variables: {
          id: category.id
        },

        update: () => {
          this.$refs.graphqlTable.reset()
          this.$store.dispatch('snackbar/success', 'Kategorija odstranjena')
        }
      })
    },

    clearCategoryCache(apolloStore) {
      const queries = apolloStore.data.data
      for (const query in queries) {
        if (queries[query].__typename === 'categories') {
          delete queries[query]
        }
      }
    }
  }
}
</script>

<style></style>
