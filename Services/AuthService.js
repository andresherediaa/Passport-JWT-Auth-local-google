const jwt = require("jsonwebtoken");

// check if Token exists on request Header and attach token to request as attribute
exports.checkTokenMW = (req, res, next) => {
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
exports.verifyToken = (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            return (req.authData = authData);
        }
    });
};

// Issue Token
exports.signToken = (req, res) => {
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
