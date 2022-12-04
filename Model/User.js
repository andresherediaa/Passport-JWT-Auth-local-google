const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const validator = require("validator");

// Basic User Schema for Google Authentication
const userSchema = new Schema({
    firstName: {
        type: String,
    },
    lastName: { type: String },
    profilePhoto: {
        type: String,
    },
    password: {
        type: String,
    },
    source: { type: String, required: [true, "source not specified"] },
    lastVisited: { type: Date, deefault: new Date() },
    email: {
        type: String,
        required: [true, "email required"],
        unique: [true, "email already registered"],
        lowercase: true,
        validate: [validator.isEmail, "Enter a valid email address"],
    },
    googleId: {
        type: String,
        default: null,
    },
});

module.exports = mongoose.model("User", userSchema);
