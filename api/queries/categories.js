export default {
  getAll() {
    return `{
      categories {
        category_group {
          id
          name
        }
        id
        name
      }
    }`
  }
}
