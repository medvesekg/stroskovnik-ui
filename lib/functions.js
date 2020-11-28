export function groupBy(array, groupFunction) {
  const grouped = {}
  for (const item of array) {
    const key = groupFunction(item)

    if (grouped[key] === undefined) {
      grouped[key] = {
        key: key,
        items: []
      }
    }
    grouped[key].items.push(item)
  }
  return Object.values(grouped)
}

export function median(array) {
  const copy = array.slice()
  const sorted = copy.sort((a, b) => a - b)
  const middle = sorted.length / 2
  if (middle % 1 === 0) {
    return sorted[middle]
  }
  const lower = sorted[Math.floor(middle)]
  const higher = sorted[Math.ceil(middle)]
  return (higher + lower) / 2
}
