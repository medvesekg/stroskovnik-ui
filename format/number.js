import merge from 'lodash/merge'

function userNumberFormat(val, options) {
  return Number(val).toLocaleString(undefined, options)
}

function userPercentFormat(val, options) {
  options = merge(
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    },
    options
  )
  return (val * 100).toLocaleString(undefined, options) + '%'
}

export { userNumberFormat, userPercentFormat }
