const mongoose = require("mongoose");
let hm = new mongoose.Schema({
author: String,
authorID: String,
updateMessage: String,
});

module.exports = mongoose.model("lastupdates", hm);