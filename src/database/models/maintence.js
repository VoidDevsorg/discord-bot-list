const mongoose = require("mongoose");
let hm = new mongoose.Schema({
server: String,
reason: String,
bakimmsg: String
});

module.exports = mongoose.model("bakim", hm);