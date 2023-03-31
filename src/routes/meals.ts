import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkUserIdExists } from '../midllewares/check-user-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const userId = request.cookies.userId

    const registerMealBodySchema = z.object({
      name: z.string().min(3),
      description: z.string(),
      dateTime: z.string().datetime(),
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
        dateTime: z.string().datetime(),
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

  // metrics

  app.get(
    '/total',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const total = await knex('meals')
        .where('user_id', userId)
        .count('*', { as: 'total' })
      return total
    },
  )
  app.get(
    '/in',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const totalIn = await knex('meals')
        .where({
          user_id: userId,
          diet: 'in',
        })
        .count('*', { as: 'in' })
      return totalIn
    },
  )
  app.get(
    '/out',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const userId = request.cookies.userId

      const totalOut = await knex('meals')
        .where({
          user_id: userId,
          diet: 'out',
        })
        .count('*', { as: 'out' })
      return totalOut
    },
  )

  app.get(
    '/best',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const userId = request.cookies.userId
      const meals = await knex('meals')
        .select('date_time', 'diet')
        .where('user_id', userId)
        .orderBy('date_time')

      const best = {
        day: '',
        quantity: 0,
      }
      if (meals.length) {
        let count = 0
        let day = ''
        let totalMeals = meals.length
        meals.forEach((item) => {
          totalMeals--
          const currentDay = new Date(item.date_time).toDateString()
          if (day !== currentDay || totalMeals === 0) {
            if (best.quantity < count) {
              best.day = day
              best.quantity = count
              count = 0
            }
            day = currentDay
            if (item.diet === 'in') {
              count++
            } else {
              if (count > best.quantity) {
                best.day = currentDay
                best.quantity = count
              } else {
                count = 0
              }
            }
          } else {
            if (item.diet === 'in') {
              count++
            } else {
              count = 0
            }
          }
        })
      }

      return { best }
    },
  )
}
