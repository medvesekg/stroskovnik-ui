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
