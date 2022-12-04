const handleDuplicateKeyError = (err, res) => {
    const field = Object.keys(err.keyValue);
    const code = 409;
    const error = `An account with that ${field} already exists.`;
    res.status(code).send({ messages: error, fields: field });
};

const handleValidateError = (err, res) => {
    const code = 400;
    const error =
        err.errors[Object.keys(err.errors)[0]]["properties"]["message"] ||
        "Unexpected Error in Paswword or Email Validation";
    res.status(400).send({ error: error });
};

const handleValidateErrorPassword = (err, res) => {
    const code = 400;
    const error = err.error;
    res.status(code).send(error);
};

const handleJWTError = (err, res) => {
    const code = 401;
    const error = err.message;
    res.status(code).send(error);
};

module.exports = function (err, req, res, next) {
    try {
        if (err.code && err.code == 11000)
            return (err = handleDuplicateKeyError(err, res));
        if (err.name === "ValidationError")
            return handleValidateError(err, res);
        if (err.name === "JWTException") return handleJWTError(err, res);
        if (err.message) err.error = { error: err.message };
        return handleValidateErrorPassword(err, res);
    } catch (err) {
        res.status(500).send("An unknown error occured.");
    }
};
