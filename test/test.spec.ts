import { execSync } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

let userId: string[]

describe('Meals Test E2E', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a user', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })

    expect(response.status).toEqual(201)
  })

  it('should be able to register a meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    const response = await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    expect(response.status).toEqual(201)
  })
  it('should be able to update a meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    const meal = await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    const updatedMeal = await request(app.server)
      .put(`/meals/${meal.body.id}`)
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'out',
      })
    expect(updatedMeal.body.diet).toEqual('out')
  })
  it('should be able to delete a meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    const meal = await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    const response = await request(app.server)
      .delete(`/meals/${meal.body.id}`)
      .set('Cookie', userId)

    expect(response.status).toEqual(200)
  })
  it('should be able to list meals', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Pão doce',
        description: 'carboidratos',
        dateTime: new Date(2023, 3, 30, 11, 0, 0),
        diet: 'out',
      })
    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', userId)
    expect(response.body.meals).toHaveLength(2)
  })
  it('should be able to get data of a meal ', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    const meal = await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    const response = await request(app.server)
      .get(`/meals/${meal.body.id}`)
      .set('Cookie', userId)

    console.log(response.body)
  })
  it('should be able to get total meals', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Pão doce',
        description: 'carboidratos',
        dateTime: new Date(2023, 3, 30, 11, 0, 0),
        diet: 'out',
      })
    const response = await request(app.server)
      .get('/meals/total')
      .set('Cookie', userId)
    console.log(response.body)
    expect(response.body.total).toEqual(2)
  })
  it('should be able to get total meals in diet', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Pão doce',
        description: 'carboidratos',
        dateTime: new Date(2023, 3, 30, 11, 0, 0),
        diet: 'out',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Pão doce',
        description: 'carboidratos',
        dateTime: new Date(2023, 3, 30, 14, 0, 0),
        diet: 'out',
      })
    const response = await request(app.server)
      .get('/meals/in')
      .set('Cookie', userId)
    expect(response.body.in).toEqual(1)
  })
  it('should be able to get total meals out diet', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Pão doce',
        description: 'carboidratos',
        dateTime: new Date(2023, 3, 30, 11, 0, 0),
        diet: 'out',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Pão doce',
        description: 'carboidratos',
        dateTime: new Date(2023, 3, 30, 14, 0, 0),
        diet: 'out',
      })
    const response = await request(app.server)
      .get('/meals/out')
      .set('Cookie', userId)
    expect(response.body.out).toEqual(2)
  })
  it('should be able to get the best sequence of in diet meal.', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'Flavio Cezar',
    })
    userId = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 8, 0, 0),
        diet: 'in',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Tapioca',
        description: 'integral',
        dateTime: new Date(2023, 3, 30, 9, 0, 0),
        diet: 'in',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Pão doce',
        description: 'carboidratos',
        dateTime: new Date(2023, 3, 30, 11, 0, 0),
        diet: 'out',
      })
    await request(app.server)
      .post('/meals')
      .set('Cookie', userId)
      .send({
        name: 'Pão doce',
        description: 'carboidratos',
        dateTime: new Date(2023, 3, 30, 14, 0, 0),
        diet: 'out',
      })
    for (let index = 1; index <= 4; index++) {
      await request(app.server)
        .post('/meals')
        .set('Cookie', userId)
        .send({
          name: 'Tapioca',
          description: 'integral',
          dateTime: new Date(2023, 3, 29, 5 + index, 0, 0),
          diet: 'in',
        })
    }
    const response = await request(app.server)
      .get('/meals/best')
      .set('Cookie', userId)
    expect(response.body.quantity).toEqual(4)
  })
})
