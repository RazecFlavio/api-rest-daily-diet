import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().min(3),
    })

    const { name } = createUserBodySchema.parse(request.body)

    const userId = randomUUID()

    await knex('users').insert({
      id: userId,
      name,
    })

    reply.cookie('userId', userId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
    })

    return reply.status(201).send()
  })

  app.get('/', async (request, reply) => {
    const users = await knex.table('users').select()

    return {
      users,
    }
  })
}
