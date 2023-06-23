import * as sdk from 'botpress/sdk'
import { Session } from 'inspector'
import { SDK } from '.'

export default class Database {
  knex: any
  //event: sdk.IO.Event

  constructor(private bp: SDK) {
    this.bp.logger.info('in contructor')
    this.knex = bp.database
  }

  initialize() {
    this.bp.logger.info('initializing db')
    if (!this.knex) {
      throw new Error('You must initialize the database before')
    }
    return this.knex
      .createTableIfNotExists('my_module_table', function(table) {
        this.bp.logger.info('creating my_module_table')
        table.increments('id').primary()
        table.string('type')
        table.string('text', 640)
        table.jsonb('raw_message')
        table.timestamp('ts')
        this.bp.logger.info('Table is created!!')
      })
      .then(async (event: sdk.IO.Event) => {
        this.bp.logger.info('my_module_table_event')
        let data = {}
        const someObject = (await this.knex.insertAndRetrieve)(
          'my_module_table',
          (data = {
            type: 'basic',
            text: 'testing',
            raw_message: 'Hello new Mod',
            ts: this.knex.date.now()
          }),
          '*'
        ).then(res => this.bp.logger.info('res :', res))

        this.bp.logger.info('Someobject :', { ...someObject })

        return { ...someObject }
      })
  }
}
