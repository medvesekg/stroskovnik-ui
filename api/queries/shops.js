export default {
  getAll: `{ shops {id, name} }`,

  create(name) {
    return `mutation {
      insert_shops(objects: { name: "${name}"}) {
        returning {
          id
          name
        }
      }
    }`
  }
}
