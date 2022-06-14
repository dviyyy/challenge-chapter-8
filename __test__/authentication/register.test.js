const request = require('supertest');
const app = require('../../app');
const { User } = require('../../app/models');
// const bcrypt = require ('bcryptjs')

const userOne = {
  name: 'Deviii',
  email: 'abcd@gmail.com',
  password: '123456',
};

const userTwo = {
  name: 'Zoozoo',
  email: 'zoozoo@gmail.com',
  password: '123456',
  role: 2,
};

describe('POST /v1/auth/register', () => {

  beforeEach(async () => {
    await User.create(userTwo);
  });
  
  afterAll(async () => {

    const Users = await User.destroy({
      where: {
        email: userOne.email,
      }
    })
    console.log(Users)
    await User.destroy({
      where: {
        email: userTwo.email,
      },
    });
  });

  it('should response with 201 as status code which means user successfully registered', 
  async () => {await request(app)
    .post('/v1/auth/register')
    .set('Content-Type', 'application/json')
    .send(userOne)
    .then((res) => {
      expect(res.statusCode).toBe(201);
      expect(res.body.accesToken).toEqual(res.body.accesToken);
    })});
  

    it('should response with 422 as status code which means email already registered before', async () => request(app)
    .post('/v1/auth/register')
    .set('Content-Type', 'application/json')
    .send(userTwo)
    .then((res) => {
      expect(res.statusCode).toBe(422);
      expect(res.body.error.details.email.toLowerCase()).toEqual(
        userTwo.email.toLowerCase(),
      );
    }));

    // it('should response with 500 as status code which means nothing is send', async () => request(app)
    // .post('/v1/auth/register')
    // .set('Content-Type', 'application/json')
    // .send({

    // })
    // .then((res) => {
    //   expect(res.statusCode).toBe(500);
    //   expect(res.body.error.message).toEqual("Cannot read properties of undefined (reading 'toLowerCase')");
    // }));
});