import API from '@/api/api'
import categoryQueries from '@/api/queries/categories'

export const state = () => ({
  all: []
})

export const mutations = {
  SET_CATEGORIES(state, categories) {
    state.all = categories
  }
}

export const actions = {
  getCategories({ state, dispatch }) {
    if (state.all.length) {
      return state.all
    } else {
      return dispatch('fetchCategories')
    }
  },
  async fetchCategories({ state, commit, rootState }) {
    const response = await API.query(categoryQueries.getAll(), {
      state: rootState
    })
    commit('SET_CATEGORIES', response.categories)
    return response.all
  }
}
