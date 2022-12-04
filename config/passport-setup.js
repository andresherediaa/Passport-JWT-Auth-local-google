const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
let mongoose = require("mongoose");
const User = mongoose.model("User");

require("dotenv").config();

passport.use(
    new GoogleStrategy(
        {
            // options for strategy
            callbackURL: "http://localhost:3000/auth/google/callback",
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
        },
        async (accessToken, refreshToken, profile, done) => {
            const email = profile.emails[0].value;
            const source = profile.provider;

            // check if user already exists
            const currentUser = await User.findOne({ googleId: profile.id });
            if (currentUser) {
                // already have the user -> return (login)
                return done(null, currentUser);
            } else {
                // register user and return
                const newUser = await new User({
                    email: email,
                    googleId: profile.id,
                    source,
                }).save();
                return done(null, newUser);
            }
        }
    )
);
