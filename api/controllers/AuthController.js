/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var passport = require('passport');
var crypto = require('crypto');
var GoogleStrategy = require('passport-google-oauth2');

passport.serializeUser( function (user, done) {
  sails.log('Serializing user: ' + user.email);
  done(null, user.email);
});

passport.deserializeUser( function (serializedUser, done) {
  sails.log('Deseriailizing');
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
    sails.log('oauth handler');
    User.findOrCreate({email: user.emails[0].value}, function(err, user){
      sails.log('User: ' + user.email);
      return done(err, user);
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
      sails.log('google callback inside');
      if (!user || err) {
        sails.log('User: ' + user.email);
        sails.log('Err: ' + err);
        return res.json(false);
      }

      req.logIn(user, function(err) {
        if (err) {
          sails.log('Err: ' + err);
          return res.json(false);
        } else {
          var token = crypto.randomBytes(64).toString('base64');
          User.update({email: user.email}, {accessToken: token}, function (err, user) {
            if (err) {
              sails.log('Err: ' + error);
              return res.json(false);
            }
            sails.log('Token Granted: ' + token);
            return res.json({token: token});
          });
        }
      });
    })(req, res, next);
  }
};

