let jwtToken = 'Rahasia';
if (process.env.JWT_SIGNATURE_KEY) {
  jwtToken = process.env.JWT_SIGNATURE_KEY;
}
module.exports = {
  MORGAN_FORMAT: ':method :url :status :res[content-length] - :response-time ms',
  JWT_SIGNATURE_KEY: jwtToken,
};
