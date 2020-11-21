<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <date-range-input v-model="range" label="Obdobje" type="month" />
        </v-col>
        <v-col>
          <category-select v-model="categoryId" />
        </v-col>
        <v-col>
          <shop-select v-model="shopId" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="10">
          <expenses-chart
            group-by="month"
            :category-id="categoryId"
            :shop-id="shopId"
            :from="from"
            :to="to"
            @average="average = $event"
          />
        </v-col>
        <v-col cols="12" md="2">
          <total-expenses
            :from="from"
            :to="to"
            :category-id="categoryId"
            :shop-id="shopId"
          />
          <total-invoices
            :from="from"
            :to="to"
            :category-id="categoryId"
            :shop-id="shopId"
          />
          <total-invoice-items
            :from="from"
            :to="to"
            :category-id="categoryId"
            :shop-id="shopId"
          />
          <v-card>
            <v-card-title>Povprečje</v-card-title>
            <v-card-text class="headline">
              <span class="error--text text--lighten-1">{{
                userNumberFormat(average, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}</span>
              <span class="float-right">€</span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import TotalInvoices from '@/components/widgets/TotalInvoices'
import TotalInvoiceItems from '@/components/widgets/TotalInvoiceItems'
import TotalExpenses from '@/components/widgets/TotalExpenses'
import ExpensesChart from '@/components/charts/ExpensesChart'
import DateRangeInput from '@/components/inputs/DateRangeInput'
import ShopSelect from '@/components/inputs/ShopSelect'
import CategorySelect from '@/components/inputs/CategorySelect'
import get from 'lodash/get'
import { userNumberFormat } from '@/format/number'

export default {
  components: {
    ExpensesChart,
    DateRangeInput,
    TotalInvoices,
    TotalInvoiceItems,
    TotalExpenses,
    ShopSelect,
    CategorySelect
  },

  data() {
    return {
      categoryId: null,
      shopId: null,
      range: null,
      average: 0
    }
  },

  computed: {
    from() {
      return get(this.range, 'from', null)
    },
    to() {
      return get(this.range, 'to', null)
    }
  },

  methods: {
    userNumberFormat
  }
}
</script>

<style></style>
