import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkUserIdExists } from '../midllewares/check-user-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log('Rota de Meals: ', `${request.url}`)
  })
  app.post('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const userId = request.cookies.userId

    const registerMealBodySchema = z.object({
      name: z.string().min(3),
      description: z.string(),
      dateTime: z.coerce.date(),
      diet: z.enum(['in', 'out']),
    })

    const { name, description, dateTime, diet } = registerMealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date_time: dateTime,
      diet,
      user_id: userId,
    })

    return reply.status(201).send()
  })
  app.get('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const userId = request.cookies.userId
    const meals = await knex.table('meals').where('user_id', userId).select()

    return {
      meals,
    }
  })
  app.put(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const updateMealParamSchema = z.object({
        id: z.string(),
      })

      const updateMealBodySchema = z.object({
        name: z.string().min(3),
        description: z.string(),
        dateTime: z.coerce.date(),
        diet: z.enum(['in', 'out']),
      })

      const { id } = updateMealParamSchema.parse(request.params)

      const { name, description, dateTime, diet } = updateMealBodySchema.parse(
        request.body,
      )

      await knex('meals')
        .update({
          name,
          description,
          date_time: dateTime,
          diet,
        })
        .where({ id, user_id: userId })

      return reply.status(200).send()
    },
  )
  app.delete(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const deleteMealParamSchema = z.object({
        id: z.string(),
      })

      const { id } = deleteMealParamSchema.parse(request.params)

      await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .delete()

      return reply.status(200).send()
    },
  )
  app.get(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const userId = request.cookies.userId
      const getMealParamSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealParamSchema.parse(request.params)

      const meal = await knex
        .table('meals')
        .where({
          id,
          user_id: userId,
        })
        .select()

      return {
        meal,
      }
    },
  )
}
