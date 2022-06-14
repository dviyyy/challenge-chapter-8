const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const {
  User,
  Car,
} = require('../../app/models');

const userPassword = 'deviindri';

const invalidUser = {
  name: 'Brubrun',
  email: 'customer@binar.com',
  encryptedPassword: bcrypt.hashSync(userPassword, 10),
  roleId: 1,
};

const validUser = {
  name: 'Devi',
  email: 'admin@binar.com',
  encryptedPassword: bcrypt.hashSync(userPassword, 10),
  roleId: 2,
};

let idCar = '';

const newCar = {
  name: 'Hyundai',
  price: 500000,
  size: 'SMALL',
  image: 'https://source.unsplash.com/531x531',
  isCurrentlyRented: false,
};

const invalidNewCar = {
  name: 100,
  price: 500000,
  size: 'SMALL',
  image: 'https://source.unsplash.com/531x531',
  isCurrentlyRented: false,
};

describe('POST /v1/cars', () => {
  beforeAll(async () => {
    try {
      await User.create(invalidUser);
      await User.create(validUser);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  });

  afterAll(async () => {
    try {
      await User.destroy({
        where: {
          email: invalidUser.email,
        },
      });
      await User.destroy({
        where: {
          email: validUser.email,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  });

  describe('Mission Successfull', () => {
    let token;
    beforeEach(async () => {
      await request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: validUser.email,
          password: userPassword,
        })
        .then((validRoleUser) => {
          token = validRoleUser.body.accessToken;
        });
    });

    it('should response with 201 as status code which means valid role (ADMIN) can create new car', async () => {
      await request(app)
        .post('/v1/cars')
        .set('Authorization', `Bearer ${token}`)
        .send(newCar)
        .then((adminCreateCar) => {
          expect(adminCreateCar.statusCode).toBe(201);
          idCar = adminCreateCar.body.id;
          expect(adminCreateCar.body.name).toEqual(newCar.name);
          expect(adminCreateCar.body.price).toEqual(newCar.price);
          expect(adminCreateCar.body.size).toEqual(newCar.size);
          expect(adminCreateCar.body.image).toEqual(newCar.image);
          expect(adminCreateCar.body.isCurrentlyRented).toEqual(newCar.isCurrentlyRented);
        });
    });
  });

  describe('Mission Failed', () => {
    let token;
    beforeEach(async () => {
      await request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: invalidUser.email,
          password: userPassword,
        })
        .then((invalidRoleUser) => {
          token = invalidRoleUser.body.accessToken;
        });
    });

    it('should response with 401 as status code which means invalid role (CUSTOMER) cannot create new car', async () => {
      await request(app)
        .post('/v1/cars')
        .set('Authorization', `Bearer ${token}`)
        .send(newCar)
        .then((customerCreateCar) => {
          expect(customerCreateCar.statusCode).toBe(401);
          expect(customerCreateCar.body).toEqual({
            error: {
              name: 'Error',
              message: 'Access forbidden!',
              details: {
                role: 'CUSTOMER',
                reason: 'CUSTOMER is not allowed to perform this operation.',
              },
            },
          });
        });
    });
  });

  describe('Mission Failed', () => {
    let token;
    beforeEach(async () => {
      await request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: validUser.email,
          password: userPassword,
        })
        .then((validRoleUser) => {
          token = validRoleUser.body.accessToken;
        });
    });

    it('should response with 422 as status code which means Unprocessable Entity or there is wrong input', async () => {
      await request(app)
        .post('/v1/cars')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidNewCar)
        .then((customerCreateCar) => {
          expect(customerCreateCar.statusCode).toBe(422);
          expect(customerCreateCar.body.error.message).toEqual('Name must be input in string');
        });
    });
  });
});