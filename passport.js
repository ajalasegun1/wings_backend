const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const User = require("./model/User");
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy({usernameField: "email"},function (email, password, done) {
    User.findOne({ email }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: "User not found"});
      }
      bcrypt.compare(password, user.password, (err, response) => {
        if (err) return done(null, false);
        if(!response){
            return done(null, response, {message: "Password incorrect"})
        }else{
            return done(null, user)
        }
      });
    });
  })
);


const cookieExtractor =(req)=> {
    let token = null;
    if (req && req.cookies)
    {
        token = req.cookies['access_token'];
    }
    return token;
}

passport.use(new JwtStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: "blacksheep"
}, function(jwt_payload, done) {
    User.findOne({_id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));

