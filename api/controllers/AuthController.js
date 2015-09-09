/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var passport = require('passport');
var util = require('util');

module.exports = {
  _config: {
    actions: false,
    shortcuts: false,
    rest: false
  },
  google: function(req, res) {
    sails.log('google auth');
    return passport.authenticate('google', {scope:['email']})(req, res);
  },
  googleCallback: function(req, res, next) {
    sails.log('google callback');
    return passport.authenticate('google', function(err, user, info) {
      var email = user.email;

      sails.log('google callback inside');
      if (!user || err) {
        sails.log('User: ' + email);
        sails.log('Err: ' + err);
        return res.json({status: false});
      }

      sails.log('Preparing to Log in user: ' + email);
      req.logIn(user, function(err) {
        if (err) {
          sails.log('Err: ' + err);
          return res.json({status: false});
        } else {
          User.findOne({email: email}, function (err, user) {
            if (err || !user) {
              sails.log('Error logging in user: ' + err);
              return res.json({status: false});
            }
            var token = user.accessToken;
            sails.log('Logged In User: ' + util.inspect(user));
            sails.log('Token Granted: ' + token);
            return res.json({token: token});
          });
        }
      });
    })(req, res, next);
  }
};

