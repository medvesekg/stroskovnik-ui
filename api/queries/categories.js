export default {
  getAll() {
    return `{
      categories {
        subcategories {
          id
          name
        }
        id
        name
      }
    }`
  }
}
