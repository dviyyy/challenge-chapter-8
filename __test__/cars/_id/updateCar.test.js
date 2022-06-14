const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../../app');
const { User, Car } = require('../../../app/models');

describe('Cars /v1/cars/:id', () => {
  let car;

  let accessToken;

  beforeAll(async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'Fikri@binar.co.id',
        password: '123456',
      });

    accessToken = response.body.accessToken;

    car = await Car.create({
      name: 'Hyundai',
      price: 500000,
      size: 'SMALL',
      image: 'https://source.unsplash.com/531x531',
      isCurrentlyRented: false,
    });
    return car;
  });

  afterAll(() => car.destroy());

  it('should response with 201 as status code which means valid role (ADMIN) can update new car', async () => {
    await request(app)
    .put(`/v1/cars/${car.id}`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      name: 'Avanza',
      price: 400000,
      size: 'SMALL',
      image: 'https://source.unsplash.com/531x531',
    })
    .then((res) => {
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toEqual('Data have been updated successfully');
    });
  });
});

describe('Cars /v1/cars/:id', () => {
  let car;
  let accessToken;
  beforeAll(async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'Fikri@binar.co.id',
        password: '123456',
      });
    accessToken = response.body.accessToken;
    car = await Car.create({
      name: 'Hyundai',
      price: 500000,
      size: 'SMALL',
      image: 'https://source.unsplash.com/531x531',
      isCurrentlyRented: false,
    });
    return car;
  });

  afterAll(() => car.destroy());

  it('should response with 422 as status code which means Unprocessable Entity or there is wrong input', async () => {
    await request(app)
    .put(`/v1/cars/${car.id}`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      name: 1000,
      price: 400000,
      size: 'SMALL',
      image: 'https://source.unsplash.com/531x531',
    })
    .then((res) => {
      expect(res.statusCode).toBe(422);
      expect(res.body.error.message).toEqual('Car name must be input in string');
    });
  });
});