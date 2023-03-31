// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      date_time: string
      diet: 'in' | 'out'
      user_id: string
    }
    users: {
      id: string
      name: string
    }
  }
}
