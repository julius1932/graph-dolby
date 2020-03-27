const router = require('express').Router()
//Initializes an instance of the Router class.
const User = require('../models/user');
const bcrypt = require('bcryptjs');
//imports the user model and the BcryptJS Library
// BcryptJS is a no setup encryption tool
require('dotenv').config();
const secret = process.env.SECRET || 'the default secret';
//gives us access to our environment variables 
//and sets the secret object.
const passport = require('passport');
const jwt = require('jsonwebtoken');
//imports Passport and the JsonWebToken library for some utilities

router.get('/register', (req, res) => {
 // res.sendFile(__dirname.split("routes")[0] + 'login-las.html');
})
router.post('/register', (req, res) => {
    User.findOne({ emailAddress: req.body.emailAddress })
        .then(user => {
            if (user) {
                let error = 'Email Address Exists in Database.';
                return res.status(400).json(error);
            } else {
                const newUser = new User({
                    name: req.body.name,
                    emailAddress: req.body.emailAddress,
                    password: req.body.password
                });
               
               bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(newUser.password, salt,
                        (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save().then(user => res.json({yy:user}))
                                .catch(err => res.status(400).json(err));
                        });
                });
            }
        });
});
router.get('/login', (req, res) => {
  res.sendFile(__dirname.split("routes")[0] + 'login-las.html');
})
router.post('/login', (req, res) => {
  let errors={};
    const emailAddress = req.body.emailAddress;
    const password = req.body.password;
    
    User.findOne({ emailAddress })
        .then(user => {
            if (!user) {
                errors.error = "No Account Found";
                //res.status(400).jsonp(errors);
                return res.jsonp(errors);
            }
            console.log("ooooooooooooooooooooooooooooooooooooooooooooooooo");
            console.log(user);
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = {
                            id: user._id,
                            name: user.emailAddress
                        };
                        jwt.sign(payload, secret, { expiresIn: 36000 },
                            (err, token) => {
                                if (err) res.status(500)
                                    .jsonp({
                                        error: "Error signing token",
                                        raw: err
                                    });
                                res.jsonp({
                                    success: true,
                                    token: `jwt ${token}`
                                });
                            });
                    } else {
                        errors.error = "Password is incorrect";
                        //res.status(400).jsonp(errors);
                        res.jsonp(errors);
                    }
                });
        });
});
module.exports = router;