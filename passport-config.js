const { Strategy, ExtractJwt } = require('passport-jwt');
//this is using ES6 Destructuring. If you're not using a build step,
//this could cause issues and is equivalent to
// const pp-jwt = require('passport-jwt');
// const Strategy = pp-jwt.Strategy;
// const ExtractJwt = pp-jwt.ExtractJwt;
require('dotenv').config();
const secret = process.env.SECRET || 'some other secret as default';
const mongoose = require('mongoose');
const User = require('./models/user');
const opts = {
    //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: secret
};
//this sets how we handle tokens coming from the requests that come
// and also defines the key to be used when verifying the token.
module.exports = passport => {

    passport.use(
        new Strategy(opts, (payload, done) => {
            console.log("wwwwww");
            User.findById(payload.id)
                .then(user => {
                    if (user) {
                        return done(null, {
                            id: user._id,
                            name: user.name,
                            emailAddress: user.emailAddress,
                        });
                    }
                    return done(null, true);
                }).catch(err => console.error(err));
        })
    )
};