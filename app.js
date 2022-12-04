const express = require("express");
const app = express();
require("./Model/User");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const authServices = require("./Services/AuthServices/index");
const cookieParser = require("cookie-parser");
const errorservice = require("./Services/ErrorService/errorService");
//const flash = require("express-flash");

require("dotenv").config();
require("./config/passport-setup");
require("./config/passport-local-setup");

const mongodbUri = process.env.MONGO_URI;
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

mongoose.connect(
    mongodbUri,
    { useUnifiedTopology: true, useNewUrlParser: true },
    (error) => {
        if (error) console.log(error);
    }
);

app.use(cookieParser());
app.use(function (req, res, next) {
    let allowedOrigins = ["*"]; // list of url-s
    let origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Expose-Headers", "Content-Disposition");
    next();
});

app.use(passport.initialize());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.engine("html", require("ejs").renderFile);
app.use(express.static(__dirname + "/public"));

// ############# GOOGLE AUTHENTICATION ################
// this will call passport-setup.js authentication in the config directory

app.get(
    "/auth/google",
    passport.authenticate("google", {
        session: false,
        scope: ["profile", "email"],
        accessType: "offline",
        approvalPrompt: "force",
    })
);

// callback url upon successful google authentication
app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        authServices.signToken(req, res);
    }
);

// route to check token with postman.
// using middleware to check for authorization header
app.get("/verify", authServices.checkTokenMW, (req, res) => {
    authServices.verifyToken(req, res);
    if (null === req.authData) {
        res.sendStatus(403);
    } else {
        res.status(200).json(req.authData);
    }
});

//register manually
app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/auth/signup", (req, res) => {
    res.render("local/signup.ejs");
});

app.get("/auth/signin", (req, res) => {
    res.render("local/signin.ejs");
});

//POST ROUTES
app.post("/auth/signup", (req, res, next) => {
    authServices.addLocalUser(req, res, next);
});

app.post(
    "/auth/signin",
    passport.authenticate("local", {
        session: false,
    }),
    (req, res) => {
        authServices.signToken(req, res);
    }
);

//error handler for request
app.use(errorservice);

//LISTEN SERVER
app.listen(3000, function () {
    console.log("Express app listening on port 3000!");
});
