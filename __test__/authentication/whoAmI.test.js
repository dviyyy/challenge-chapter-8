const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const { User } = require('../../app/models');
const { AuthenticationController } = require('../../app/controllers');

const userPassword = 'springday';

const validUser = {
  name: 'Devi',
  email: 'customer@binar.com',
  encryptedPassword: bcrypt.hashSync(userPassword, 10),
  roleId: 1,
};

const invalidUser = {
  name: 'Agnes',
  email: 'admin@binar.com',
  encryptedPassword: bcrypt.hashSync(userPassword, 10),
  roleId: 2,
};

describe('GET /v1/auth/whoami', () => {
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

    it('should response with 200 as status code which means valid role (CUSTOMER)', async () => {
     await request(app)
        .get('/v1/auth/whoami')
        .set('Authorization', `Bearer ${token}`)
        .then((whichValidUser) => {
          expect(whichValidUser.statusCode).toBe(200);
          expect(whichValidUser.body.name).toEqual(validUser.name);
          expect(whichValidUser.body.email).toEqual(validUser.email.toLowerCase());
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

    it('should response with 401 as status code which means invalid role (ADMIN)', () => {
      request(app)
        .get('/v1/auth/whoami')
        .set('Authorization', `Bearer ${token}`)
        .then((whichInvalidUser) => {
          expect(whichInvalidUser.statusCode).toBe(401);
          expect(whichInvalidUser.body).toEqual({
            error: {
              name: 'Error',
              message: 'Access forbidden!',
              details: {
                role: 'ADMIN',
                reason: 'ADMIN is not allowed to perform this operation.',
              },
            },
          });
        });
    });
  });
});
// check user not found and role not found
describe('#handleGetUser', () => {
  // data user not found
  const userNotFound = {
    user: {
      id: 1000,
      name: 'User Not Found Test',
      email: 'usernotFound@mail.com',
      role: { id: 1, name: 'CUSTOMER' },
    },
  };
  beforeEach(async () => {
    // before test delete user id not found
    try {
      const checkUserNotFound = await User.findByPk(userNotFound.id);
      if (checkUserNotFound) {
        await User.destroy({
          where: {
            // delete where with id
            id: userNotFound.id,
          },
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });
  // get test status code 404 error
  describe('GET should response with 404 as status code', () => {
    // id users after create users
    const UserRoleNotFound = {
      id: 3000,
      roleId: 10,
    };
    // create user Role Not Found Test
    it('User not found', async () => {
      // create model
      const mockAuthModel = {};
      mockAuthModel.findByPk = jest.fn();
      // create respond
      const mockResponse = {};
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.json = jest.fn().mockReturnThis();
      // declaration class auth controller with constructor uderModel
      const authController = new AuthenticationController({
        userModel: mockAuthModel,
      });
      // execution with request and response
      await authController.handleGetUser(userNotFound, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.anything());
    });
    it('Role not found', async () => {
      // create model
      const mockTask = new User(UserRoleNotFound);
      const mockAuthModel = {};
      mockAuthModel.findByPk = jest.fn().mockReturnValue(mockTask);
      const mockAuthModelRole = {};
      mockAuthModelRole.findByPk = jest.fn();
      // create respond
      const mockResponse = {};
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.json = jest.fn().mockReturnThis();
      // declaration class auth controller with constructor uderModel
      const authController = new AuthenticationController({
        roleModel: mockAuthModelRole,
        userModel: mockAuthModel,
      });
      // execution with request and response
      await authController.handleGetUser(
        { user: { id: UserRoleNotFound.id } },
        mockResponse,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.anything());
    });
  });
});