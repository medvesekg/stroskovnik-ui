const fs = require('fs')
const axios = require('axios')

function getTableColumns() {
  return axios
    .post('https://stroskovnik-test.herokuapp.com/v1/query', {
      type: 'run_sql',
      args: {
        sql:
          "select column_name,data_type,table_name from information_schema.columns where table_schema = 'public'"
      }
    })
    .then(response => {
      const COLUMN_NAME = 0
      const DATA_TYPE = 1
      const TABLE_NAME = 2

      const columns = response.data.result.slice(1)

      const definitions = {}
      for (const dbColumn of columns) {
        table = definitions[dbColumn[TABLE_NAME]]
        if (table === undefined) {
          table = {}
          definitions[dbColumn[TABLE_NAME]] = table
        }
        let column = table[dbColumn[COLUMN_NAME]]
        if (column === undefined) {
          column = {}
          table[dbColumn[COLUMN_NAME]] = column
        }
        column.type = dbColumn[DATA_TYPE]
      }
      return definitions
    })
}

function getMetadata() {
  return axios
    .post('https://stroskovnik-test.herokuapp.com/v1/query', {
      type: 'export_metadata',
      args: {}
    })
    .then(meta => {
      return getForeignKeys().then(foreignKeys => {
        const tables = meta.data.tables
        const metadata = {}
        for (const table of tables) {
          let relations = metadata[table.table.name]
          if (relations === undefined) {
            relations = {}
            metadata[table.table.name] = relations
          }
          if (table.object_relationships) {
            for (const relation of table.object_relationships) {
              if (relation.using.manual_configuration) {
                relations[relation.name] = {
                  table: relation.using.manual_configuration.remote_table.name
                }
              } else {
                relations[relation.name] = {
                  table:
                    foreignKeys[table.table.name][
                      relation.using.foreign_key_constraint_on
                    ].table
                }
              }
            }
          }
          if (table.array_relationships) {
            for (const relation of table.array_relationships) {
              if (relation.using.manual_configuration) {
                relations[relation.name] = {
                  table: relation.using.manual_configuration.remote_table.name
                }
              } else {
                relations[relation.name] = {
                  table: relation.using.foreign_key_constraint_on.table.name
                }
              }
            }
          }
        }
        return metadata
      })
    })
}

function getForeignKeys() {
  return axios
    .post('https://stroskovnik-test.herokuapp.com/v1/query', {
      type: 'run_sql',
      args: {
        sql: `
    SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
    `
      }
    })
    .then(response => {
      const TABLE = 0
      const COLUMN = 1
      const FOREIGN_TABLE = 2

      const foreignKeys = response.data.result.slice(1)
      const keys = {}
      for (const foreignKey of foreignKeys) {
        let table = keys[foreignKey[TABLE]]
        if (table === undefined) {
          table = {}
          keys[foreignKey[TABLE]] = table
        }
        let column = table[foreignKey[COLUMN]]
        if (column === undefined) {
          column = {}
          table[foreignKey[COLUMN]] = column
        }
        column.table = foreignKey[FOREIGN_TABLE]
      }

      return keys
    })
}

Promise.all([getTableColumns(), getMetadata()]).then(([tables, relations]) => {
  for (const table in relations) {
    const tableRelations = relations[table]
    for (const relation in tableRelations) {
      const relationTable = tableRelations[relation].table
      tables[table][relation] = { type: 'relation', table: relationTable }
    }
  }

  fs.writeFile('definitions.json', JSON.stringify(tables, null, '\t'), function(
    err
  ) {
    if (err) {
      console.error('Could not create definitions.json')
      return 1
    }
    console.log('definitions.json created')
    return 0
  })
})
