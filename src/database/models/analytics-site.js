const mongoose = require("mongoose");
let hm = new mongoose.Schema({
id: String,
country: Array,
});

module.exports = mongoose.model("analytics", hm);
