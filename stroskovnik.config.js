require('dotenv').config()

const apiVersion = 'v1'

const hasuraDomain = process.env.NUXT_ENV_HASURA_DOMAIN
const hasuraApiUri = hasuraDomain + '/' + apiVersion
const hasuraApiUrl = 'https://' + hasuraApiUri
const graphqlEndpoint = hasuraApiUrl + '/graphql'
const wssEndpoint = 'wss://' + hasuraApiUri + '/graphql'
const healthEndpoint = hasuraApiUrl + '/healthz' 
const queryEndpoint = hasuraApiUrl + '/query'

const config = {
    apiVersion,
    hasuraDomain,
    hasuraApiUri,
    hasuraApiUrl,
    graphqlEndpoint,
    wssEndpoint,
    healthEndpoint,
    queryEndpoint
}

module.exports = config