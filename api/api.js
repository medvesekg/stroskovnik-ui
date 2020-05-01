import axios from 'axios'

const GRAPH_QL_ENDPOINT = process.env.NUXT_ENV_GRAPHQL_ENDPOINT

export default {
  query(q, store) {
    return new Promise((resolve, reject) => {
      axios
        .post(
          GRAPH_QL_ENDPOINT,
          { query: q },
          { headers: { Authorization: `Bearer ${store.state.auth.token}` } }
        )
        .then(response => resolve(response.data.data))
        .catch(e => reject(e))
    })
  }
}
