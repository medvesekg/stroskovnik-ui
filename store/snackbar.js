export const state = () => ({
  visible: false,
  message: null,
  color: null
})

export const mutations = {
  SET_SNACKBAR(state, { message, color }) {
    state.message = message
    state.color = color
    state.visible = true
  },
  RESET_SNACKBAR(state) {
    state.message = null
    state.color = null
    state.visible = false
  }
}

export const actions = {
  success({ commit }, message) {
    commit('SET_SNACKBAR', {
      message: message,
      color: 'success'
    })
  },
  error({ commit }, message) {
    commit('SET_SNACKBAR', {
      message: message,
      color: 'error'
    })
  },
  reset({ commit }) {
    commit('RESET_SNACKBAR')
  }
}
