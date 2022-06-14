const ApplicationError = require('./ApplicationError');

class WrongPasswordError extends ApplicationError {
  constructor() {
    super('Password is not correct!');
    this.message='Password is wrong';
  }
  get details(){
    return {message:this.message}
  }
}

module.exports = WrongPasswordError;
