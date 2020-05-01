export const state = () => ({
  email: ''
})

export const mutations = {
  setUser(state, { email }) {
    state.email = email
  },
  resetUser(state) {
    state.email = ''
  }
}
