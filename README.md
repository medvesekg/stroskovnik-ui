# Setup dev database
- Create backup of production db
`heroku pg:backups:capture -a stroskovnik-graphql`
- Get URL of backup
`heroku pg:backups public-url -a stroskovnik-graphql`
- Restore dev db with backup of production db
`heropku pg:backups:restore ${URL} -a stroskovnik-graphql-test`