<template>
  <div>
    <app-chart :width="3" :height="1" :options="chart" />

    <graphql-table
      resource="invoice_items"
      :fields="[
        'name',
        'invoice.shop.name',
        'cost',
        'quantity',
        'invoice.date'
      ]"
      :filter="{
        name: { _eq: $route.params.id }
      }"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import GraphqlTable from '@/components/GraphqlTable'
import AppChart from '@/components/app/AppChart'

export default {
  components: { GraphqlTable, AppChart },
  apollo: {
    items: {
      query: gql`
        query InvoiceItems($name: String) {
          invoice_items(
            where: { name: { _eq: $name } }
            order_by: { invoice: { date: asc } }
          ) {
            quantity
            total
            invoice {
              date
              shop {
                name
              }
            }
            cost
            category {
              name
            }
          }
        }
      `,
      variables() {
        return {
          name: this.$route.params.id
        }
      },
      update: data => data.invoice_items
    }
  },

  computed: {
    chart() {
      if (this.items) {
        return {
          type: 'line',
          data: {
            datasets: [
              {
                label: 'Cena',
                data: this.items.map(item => item.cost),
                fill: false,
                borderColor: this.$vuetify.theme.themes.dark.error,
                backgroundColor: this.$vuetify.theme.themes.dark.error,
                lineTension: 0
              }
            ],
            labels: this.items.map(item => {
              const date = this.$parse.date.databaseDate(item.invoice.date)
              return this.$format.date.date(date)
            })
          },
          options: {
            tooltips: {
              callbacks: {
                label: ({ value }) => {
                  return this.$format.number.currency(Number(value))
                },
                title: data => {
                  return data[0].xLabel
                }
              }
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    callback: val => this.$format.number.currency(Number(val))
                  }
                }
              ],
              xAxes: [
                {
                  ticks: {
                    callback: val => {
                      return val
                    }
                  }
                }
              ]
            },
            onClick: this.onChartClick
          }
        }
      }
      return {}
    }
  },

  methods: {
    onChartClick() {}
  }
}
</script>

<style></style>
