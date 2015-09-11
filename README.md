# OAuth API Example in Sails

+ npm install
+ rename default.env to .env and fill in credentials
  + be sure localhostpc.com is an authorized callback domain
+ add `127.0.0.1 localhostpc.com` to your hosts file
+ sails lift

visit localhostpc.com:1337/auth/google/callback and login to get a token
