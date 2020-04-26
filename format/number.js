function userNumberFormat(val, options) {
  return Number(val).toLocaleString(undefined, options)
}

export { userNumberFormat }
