let mongoose = require("mongoose");
let Schema = mongoose.Schema;

// Basic User Schema for Google Authentication
const userSchema = new Schema({
    firstName: {
        type: String,
    },
    lastName: { type: String },
    profilePhoto: { type: String },
    password: { type: String },
    source: { type: String, required: [true, "source not specified"] },
    lastVisited: { type: Date, deefault: new Date() },
    email: {
        type: String,
        required: [true, "email required"],
        unique: [true, "email already registered"],
    },
    googleId: {
        type: String,
        default: null,
    },
});

module.exports = mongoose.model("User", userSchema);
