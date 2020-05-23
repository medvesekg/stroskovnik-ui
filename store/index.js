import jwtDecode from 'jwt-decode'
const cookieParser = require('cookie')

export const actions = {
  nuxtServerInit({ commit }, { req }) {
    if (req.headers.cookie) {
      const cookie = cookieParser.parse(req.headers.cookie)
      const token = cookie ? cookie['apollo-token'] : null
      if (token) {
        const decodedToken = jwtDecode(token)
        commit('auth/SET_TOKEN', token)
        const hasuraClaim = decodedToken['https://hasura.io/jwt/claims']
        commit('auth/SET_ROLE', hasuraClaim['x-hasura-default-role'])
        commit('auth/SET_USER', { ...decodedToken, uid: decodedToken.user_id })
      }
    }
  }
}
