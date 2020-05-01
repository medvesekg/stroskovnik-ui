import API from '@/api/api'
import shopQueries from '@/api/queries/shops'

export const state = () => ({
  shops: []
})

export const mutations = {
  SET_SHOPS(state, shops) {
    state.shops = shops
  },
  ADD_SHOP(state, shop) {
    state.shops.push(shop)
  }
}

export const actions = {
  getShops({ state, dispatch }) {
    if (state.shops.length) {
      return Promise.resolve(state.shops)
    } else {
      return dispatch('fetchShops')
    }
  },
  async fetchShops({ commit, rootState }) {
    const response = await API.query(shopQueries.getAll, { state: rootState })
    commit('SET_SHOPS', response.shops)
    return response.shops
  },
  async createShop({ commit, rootState }, name) {
    const response = await API.query(shopQueries.create(name), {
      state: rootState
    })
    commit('ADD_SHOP', response.insert_shops.returning[0])
    return response.insert_shops.returning[0]
  },
  firstOrCreate({ state, dispatch }, name) {
    const existingShop = state.shops.find(shop => shop.name === name)
    if (existingShop) {
      return Promise.resolve(existingShop)
    } else {
      return dispatch('createShop', name)
    }
  }
}
