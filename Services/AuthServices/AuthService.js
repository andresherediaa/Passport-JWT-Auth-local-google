const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// check if Token exists on request Header and attach token to request as attribute
const checkTokenMW = (req, res, next) => {
    // Get auth header value
    const token = req.cookies.access_token;
    //const bearerHeader = req.headers["authorization"]; if you are usin tokenin localstorege
    if (typeof token !== "undefined") {
        req.token = token;
        next();
    } else {
        res.sendStatus(403);
    }
};

// Verify Token validity and attach token data as request attribute
const verifyToken = (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, (err, authData) => {
        if (err) {
            req.authData = null;
            throw new jwtExeption("JWT token expired");
        }
        return (req.authData = authData);
    });
};

// Issue Token
const signToken = (req, res) => {
    jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1 min" },
        (err, token) => {
            if (err) {
                res.sendStatus(500);
            } else {
                return res
                    .cookie("access_token", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        maxAge: 60000 * 60 * 24,
                    })
                    .status(200)
                    .json({ message: "Logged in successfully 😊 👌" });
            }
        }
    );
};

const addLocalUser = (User) => async (req, res, next) => {
    const { email, first_name, last_name, password } = req.body;
    try {
        if (password.length < 8) {
            throw Error("Password should be at least 8 letters");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            first_name,
            last_name,
            password: hashedPassword,
            source: "local",
        });
        await user.save();
        req.user = user;
        signToken(req, res);
        //return res.redirect("/auth/signin");
    } catch (error) {
        next(error);
    }
};

const getUserByEmail =
    (User) =>
    async ({ email }) => {
        return await User.findOne({ email });
    };

function jwtExeption(message) {
    this.message = message;
    this.name = "JWTException";
}

module.exports = (User) => {
    return {
        addLocalUser: addLocalUser(User),
        signToken,
        verifyToken,
        checkTokenMW,
        getUserByEmail: getUserByEmail(User),
    };
};
