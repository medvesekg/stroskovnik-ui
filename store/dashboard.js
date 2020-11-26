export const state = () => ({
  main: [
    [
      {
        component: 'ExpensesChartWidget',
        size: 12
      }
    ],
    [
      {
        component: 'ExpensesPieChartWidget',
        props: {
          type: 'categories'
        },
        size: 6
      },
      {
        component: 'ExpensesPieChartWidget',
        props: {
          type: 'shops'
        },
        size: 6
      }
    ],
    [
      {
        component: 'MostExpensiveItems',
        size: 12
      }
    ],
    [
      {
        component: 'MostPopularItems',
        size: 6
      },
      {
        component: 'MostExpensiveInvoices',
        size: 6
      }
    ],
    [
      {
        component: 'MostPopularShops',
        size: 12
      }
    ]
  ]
})
