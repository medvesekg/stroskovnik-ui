<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>Dobrodošli</v-card-title>
        <v-container>
          <v-row>
            <v-col sm="3">
              <v-card>
                <v-app-bar color="accent">Stroški ta mesec</v-app-bar>
                <v-container>
                  <v-row>
                    <v-col sm="6">
                      <v-card color="error lighten-1">
                        <v-card-text class="headline">
                          <v-progress-circular
                            v-if="total === null"
                            indeterminate
                          />
                          <span>{{ total }}</span>
                          <span class="float-right">€</span>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn to="/expenses" color="secondary" link>Dodaj strošek</v-btn>
          <v-btn to="/incomes" color="primary" link>Dodaj dohodek</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import API from '@/api/api'
import invoiceItemsQueries from '@/api/queries/invoice_items'

export default {
  data() {
    return {
      total: null
    }
  },

  created() {
    API.query(invoiceItemsQueries.thisMonthSum()).then(r => {
      this.total = r.invoice_items_aggregate.aggregate.sum.cost || 0
    })
  }
}
</script>

<style></style>
