export const state = () => ({
  token: null,
  user: {
    email: null
  },
  role: null
})

export const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },
  RESET_TOKEN(state) {
    state.token = null
  },
  SET_USER(state, { email }) {
    state.user.email = email
  },
  RESET_USER(state) {
    state.user.email = null
  },
  SET_ROLE(state, role) {
    state.role = role
  },
  RESET_ROLE(state) {
    state.user.role = null
  }
}

export const actions = {
  logout({ commit }) {
    commit('RESET_USER')
    commit('RESET_TOKEN')
    commit('RESET_ROLE')
  }
}
