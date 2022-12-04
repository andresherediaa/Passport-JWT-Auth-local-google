const User = require("../../Model/User");
const Authservices = require("./AuthService");

module.exports = Authservices(User);
