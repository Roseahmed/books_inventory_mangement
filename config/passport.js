const LocalStrategy = require("passport-local").Strategy
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

// passport local strategy method for verifying user credintials as provided in official passport.org site
module.exports = (passport) => {
    passport.use(new LocalStrategy({
        // property passed in req body
        usernameField: "email",
        passwordField: 'password'
    },
        function (username, password, done) {
            userModel.findOne({ email: username }, function (err, user) {
                if (err) {
                    console.log("Authentication function failed:", err);
                    return done(err);
                }
                if (!user) {
                    const message = `User name not found !!!`;
                    console.log(message);
                    return done(null, false, { message: message });
                }
                // comparing the hash password by bcrypt
                const comparePassword = bcrypt.compareSync(password, user.password);

                if (!comparePassword) {
                    const message = `Incorrect password !!!`;
                    console.log(message);
                    return done(null, false, { message: message });
                }
                console.log("Authentication successfull of user: ", user.email);
                return done(null, user);
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        userModel.findById(id, function (err, user) {
            done(err, user);
        });
    });
}