var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2');

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

