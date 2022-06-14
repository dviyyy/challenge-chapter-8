const request = require ("supertest");
const app = require ("../app");
const {NotFoundError} = require ("../app/errors");

describe('get /',() =>{
    it('show response with 200 as status code', async()=> {
        await request (app)
        .get("/")
        .then((res) => {
            expect (res.statusCode).toBe(200)
            expect (res.body.status).toEqual('OK')
            expect (res.body.message).toEqual('BCR API is up and running!')
        });
    });

    it('should response with 404 as status code which means handle not found', async () => {
        await request(app)
        .get('/car')
        .then((res) => {
          const expectedError = new NotFoundError('GET', '/car');
          expect(res.statusCode).toBe(404);
          expect(res.body.error.name).toEqual(expectedError.name);
          expect(res.body.error.message).toEqual(expectedError.message);
          expect(res.body.error.details).toEqual(expectedError.details);
        });
      });
});