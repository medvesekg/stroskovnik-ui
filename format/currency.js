import merge from 'lodash/merge'

function userCurrencyFormat(val, options) {
  options = merge({
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })
  return Number(val).toLocaleString(undefined, options)
}

export { userCurrencyFormat }
