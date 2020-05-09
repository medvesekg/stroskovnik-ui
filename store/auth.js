export const state = () => ({
  token: null,
  user: {
    id: null,
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
  SET_USER(state, { email, uid }) {
    state.user.email = email
    state.user.id = uid
  },
  RESET_USER(state) {
    state.user.email = null
  },
  SET_ROLE(state, role) {
    state.role = role
  },
  RESET_ROLE(state) {
    state.role = null
  }
}

export const actions = {
  logout({ commit }) {
    commit('RESET_USER')
    commit('RESET_TOKEN')
    commit('RESET_ROLE')
  }
}
