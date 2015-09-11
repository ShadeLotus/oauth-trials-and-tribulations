# OAuth API Example in Sails

+ npm install
+ rename default.env to .env and fill in credentials
  + be sure localhostpc.com is an authorized callback domain
+ add `127.0.0.1 localhostpc.com` to your hosts file
+ sails lift

visit localhostpc.com:1337/auth/google/callback and login to get a token
GET to localhostpc.com:1337/user with X-Bearer-Token:  to see the user list
`curl --header 'X-Bearer-Token: ...' localhostpc.com:1337/user`  see list of users
`curl -X POST --header 'X-Bearer-Token: ...' --data-urlencode 'name=kittens' localhostpc.com:1337/user/1/things`  create a thing for the user
