const mongoose = require("mongoose");
let hm = new mongoose.Schema({
userID: String,
userName: String,
link: String, 
code: String,
server: String,
});

module.exports = mongoose.model("uptime-links", hm);