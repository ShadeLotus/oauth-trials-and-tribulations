/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var passport = require('passport');
var crypto = require('crypto');
var GoogleStrategy = require('passport-google-oauth2');
var util = require('util');

passport.serializeUser( function (user, done) {
  sails.log('Serializing user: ' + user.email);
  done(null, user.email);
});

passport.deserializeUser( function (serializedUser, done) {
  sails.log('Deseriailizing: ' + serializedUser);
  User.findOne({email: serializedUser}, function(err, user) {
    sails.log('Deseriailized User: ' + user.email);
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhostpc.com:1337/auth/google/callback',
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, user, done) {
    var passportToken = req.query.code;
    sails.log('Oauth Handler');
    User.findOrCreate({email: user.emails[0].value}, function(err, user){
      if (user.hasOwnProperty('email')) {
        sails.log('User: ' + user.email);
      }

      User.update({email: user.email}, {accessToken: passportToken}, function (err, updatedUsers) {
        if (!err) {
          sails.log('Token assigned: ' + passportToken);
          sails.log('Token assigned to: ' + user.email);
        }

        done(err, user);
      });
    });
  }));

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
        return res.json(false);
      }

      sails.log('Preparing to Log in user: ' + email);
      req.logIn(user, function(err) {
        if (err) {
          sails.log('Err: ' + err);
          return res.json(false);
        } else {
          User.findOne({email: email}, function (err, user) {
            if (err || !user) {
              sails.log('Error logging in user: ' + err);
              return res.json(false);
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

