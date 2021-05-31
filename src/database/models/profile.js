const mongoose = require("mongoose");
let hm = new mongoose.Schema({
userID: String,
biography: {type: String, default: null},
website: {type: String, default: null},
github: {type: String, default: null},
twitter: {type: String, default: null},
instagram: {type: String, default: null}
});

module.exports = mongoose.model("profiles", hm);