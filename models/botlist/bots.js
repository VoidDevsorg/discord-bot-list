const mongoose = require("mongoose");
let hm = new mongoose.Schema({
ownerID: String,
ownerName: String,
botID: String,
username: String,
discrim: String,
avatar: String,
prefix: String,
longDesc: String,
shortDesc: String,
tags: Array,
coowners: Array,
status: String,
website: String,
github: String, 
support: String,
privateURL: String,
Date: {type: Date, default: null},
certificate: String,
votes: {type: Number, default: 0}
});

module.exports = mongoose.model("bots", hm);
