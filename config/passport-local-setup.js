const passport = require("passport");
const LocalStrategy = require("passport-local");
const authServices = require("./../Services/AuthServices/index");
const bcrypt = require("bcrypt");

passport.use(
    new LocalStrategy(async function (email, password, done) {
        const currentUser = await authServices.getUserByEmail({ email });
        if (!currentUser) {
            return done(new Error(`User with email ${email} does not exist`));
        }

        if (currentUser.source != "local") {
            return done(
                new Error(`You have previously signed up with Google account`)
            );
        }
        if (!bcrypt.compareSync(password, currentUser.password)) {
            return done(new Error("Incorrect password provided"));
        }
        console.log("login con registrered user", currentUser);
        return done(null, currentUser);
    })
);
