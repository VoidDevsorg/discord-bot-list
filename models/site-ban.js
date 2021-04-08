const mongoose = require("mongoose");
let hm = new mongoose.Schema({
user: String,
sebep: String,
yetkili: String
});

module.exports = mongoose.model("site-bans", hm);