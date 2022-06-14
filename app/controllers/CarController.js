const { Op } = require('sequelize');
const ApplicationController = require('./ApplicationController');
const {
  CarAlreadyRentedError,
} = require('../errors');

class CarController extends ApplicationController {
  constructor({ carModel, userCarModel, dayjs }) {
    super();
    this.carModel = carModel;
    this.userCarModel = userCarModel;
    this.dayjs = dayjs;
  }

  handleListCars = async (req, res) => {
    const offset = this.getOffsetFromRequest(req);
    const limit = req.query.pageSize;
    const query = this.getListQueryFromRequest(req);
    const cars = await this.carModel.findAll(query);
    const carCount = await this.carModel.count({ where: query.where, include: query.include });
    const pagination = this.buildPaginationObject(req, carCount);

    res.status(200).json({
      cars,
      meta: {
        pagination,
      },
    });
  };

  handleGetCar = async (req, res) => {
    const car = await this.getCarFromRequest(req);

    res.status(200).json(car);
  };

  handleCreateCar = async (req, res) => {
    try {
      const {
        name,
        price,
        size,
        image,
      } = req.body;
      if (typeof name !== 'string') {
        throw new Error('Name must be input in string');
      }
      const car = await this.carModel.create({
        name,
        price,
        size,
        image,
        isCurrentlyRented: false,
      });

      res.status(201).json(car);
    } catch (err) {
      res.status(422).json({
        error: {
          name: err.name,
          message: err.message,
        },
      });
    }
  };

  handleRentCar = async (req, res, next) => {
    try {
      const { rentStartedAt } = req.body;
      const { rentEndedAt } = req.body;
      if (!rentStartedAt && !rentEndedAt) {
        throw new Error('Please input rent date');
      }
      const car = await this.getCarFromRequest(req);

      let rentEnded = this.dayjs(rentStartedAt).add(1, 'day');

      if (rentEndedAt) {
        // eslint-disable-next-line no-self-assign
        rentEnded = rentEnded;
      }
      const activeRent = await this.userCarModel.findOne({
        where: {
          carId: car.id,
          rentStartedAt: {
            [Op.gte]: rentStartedAt,
          },
          rentEndedAt: {
            [Op.lte]: rentEndedAt,
          },
        },
      });

      if (activeRent) {
        const err = new CarAlreadyRentedError(car);
        res.status(422).json(err);
        return;
      }

      const userCar = await this.userCarModel.create({
        userId: req.user.id,
        carId: car.id,
        rentStartedAt,
        rentEndedAt,
      });

      await this.carModel.update({
        isCurrentlyRented: true,
      }, { where: { id: req.params.id } });

      res.status(201).json(userCar);
    } catch (err) {
      next(err);
    }
  };

  handleUpdateCar = async (req, res) => {
    try {
      const {
        name,
        price,
        size,
        image,
      } = req.body;

      const car = this.getCarFromRequest(req);

      const carsUpdate = await this.carModel.update(
      {
        name,
        price,
        size,
        image,
        isCurrentlyRented: false,
      },
      {
        where: {
        id: req.params.id,
      },
      },
      );
      if (typeof name !== 'string') {
        throw new Error('Car name must be input in string');
      }
      res.status(201).json(
        { message: 'Data have been updated successfully' },
        );
    } catch (err) {
      res.status(422).json({
        error: {
          name: err.name,
          message: err.message,
        },
      });
    }
  };

  handleDeleteCar = async (req, res) => {
    const car = await this.carModel.destroy({
      where: {
        id: req.params.id,
    },
    });

    res.status(200).json(
      { message: 'Data have been deleted successfully' },
      );
  };

  getCarFromRequest(req) {
    return this.carModel.findByPk(req.params.id);
  }

  getListQueryFromRequest(req) {
    const { size, availableAt } = req.query;
    const offset = this.getOffsetFromRequest(req);
    const limit = req.query.pageSize || 10;
    const where = {};
    const include = {
      model: this.userCarModel,
      as: 'userCar',
      required: false,
    };

    if (size) where.size = size;
    if (availableAt) {
      include.where = {
        rentEndedAt: {
          [Op.gte]: availableAt,
        },
      };
    }

    const query = {
      include,
      where,
      limit,
      offset,
    };

    return query;
  }
}

module.exports = CarController;