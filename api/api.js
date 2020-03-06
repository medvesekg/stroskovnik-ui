import axios from 'axios'

const GRAPH_QL_ENDPOINT =
  'https://stroskovnik-graphql.herokuapp.com/v1alpha1/graphql'

export default {
  query(q) {
    return new Promise((resolve, reject) => {
      axios
        .post(GRAPH_QL_ENDPOINT, { query: q })
        .then(response => resolve(response.data.data))
        .catch(e => reject(e))
    })
  }
}
