export const state = () => ({
  staging: []
})

export const mutations = {
  addItem(state, item) {
    state.staging.push(item)
  }
}
