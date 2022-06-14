const request = require('supertest');
const app = require('../../../app');
const { Car } = require('../../../app/models');

const newCar = {
  name: 'Hyundai',
  price: 500000,
  size: 'SMALL',
  image: 'https://source.unsplash.com/531x531',
  isCurrentlyRented: false,
};

describe('GET /v1/cars/:id', () => {
  let findCar = {};

  beforeEach(async () => {
    findCar = await Car.create(newCar);
  });

  afterEach(async () => {
    await Car.destroy({
      where: {
        id: findCar.id,
      },
    });
  });

  it('should response with 200 as status code which means user can find car by ID', async () => {
    await request(app)
      .get(`/v1/cars/${findCar.id}`)
      .set('Content-Type', 'application/json')
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
      });
   });
});