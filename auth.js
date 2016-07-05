const basicAuth = require('basic-auth');
const config = require('./config');

module.exports = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);
  console.log(user);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === config.username && user.pass === config.password) {
    return next();
  } else {
    return unauthorized(res);
  };
};