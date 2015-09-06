1. sails new oauth
1a. set config.model.migrate to 'safe'
2. add dotenv to bootstrap
2a. add passportInit and passportSession http
3. setup .env file
4. add policy 'token.js'
  + return false if X-Bearer-Token value is not set
  + return false if token value does not match a user
  + if policy passes, call next() with no params
5. generate auth controller, thing api, and user api
6. setup attributes on user model -- email and accessToken
7. init passport.serializeUser(function(user, done { ... } ));
  + serialize takes in the user profile from oauth handler
  + serialize extracts just the email and passes it on
8. init passport.deserializeUser(function (serialized, done) { ... } );
  + deserialize takes in the serialized user object
  + in this case, the serialized user is just an email addy
  + look up the full user from the db
  + return that full de-serialized user
  + if there's an error, pass it to done() as the first param
9. Configure the GoogleStrategy
  + passport.use(new GoogleStrategy({ ... }));
    + clientID = process.env.GOOGLE_CLIENT_ID
    + clientSecret = process.env.GOOGLE_CLIENT_SECRET
    + callbackURL = 'http://localhost:1337/path/to/callback'
    + passReqToCallback = true
  + strategy takes a handler which gets the oauth response
    + handler creates a local user object from oauth response
    + req, accessToken, refreshToken, profile, doneCb()
    + user object gets passed to serialize, aka doneCb()
    + serialize then passes the user object into the session
    + return the result of done()
10. AuthController needs to have auth and callback actions
  + disable properties in controller._config
    + automatic action routing (i.e. { actions: false })
    + rest (i.e. { rest: false })
    + shortcut routes in config (i.e. { shortcuts: false })
  + google
    + calls passport.authenticate('google', {scope: ['email']})(req, res);
    + google needs scope, we need email
    + passport authenticate returns middleware
    + middleware then gets called with req, res
  + googleCallback
    + passport.authenticate again, this time with a callback
    + callback gets err, user, and info
    + on successful login, we will have a user object
    + passport binds logIn() method onto req
    + pass user object to req.logIn(user, function(err) {...})
      + if no error in the callback, login successfully complete
      + create token in callback
      + update user with token in callback
        + on successful update, respond with token json
    + passport.authenticate returns middleware, again
      + passport.authenticate(...)(req, res, next)
11. Attach routes to Auth controller
  + /auth/google should go to AuthController::google()
  + /auth/google/callback to AuthController::googleCallback()
  + thing and user controllers will be auto routed
12. Attach 'token.js' policy  from step 4 to ThingController
  + ThingController { '*': ['token'] }

