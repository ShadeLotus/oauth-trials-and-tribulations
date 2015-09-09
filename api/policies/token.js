module.exports = function (req, res, next) {
  var accessToken = req.header('X-Bearer-Token');
  sails.log('token policy');

  if (!accessToken) {
    sails.log('Access token not provided');
    return res.json({status: false});
  }

  User.findOne({accessToken: accessToken}, function(err, user) {
    if (err || !user) {
      sails.log('Invalid auth');
      return res.json({status: false});
    } else {
      sails.log('token policy passed');
      next();
    }
  });
};
