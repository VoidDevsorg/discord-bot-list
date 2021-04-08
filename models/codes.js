const mongoose = require("mongoose");
let hm = new mongoose.Schema({
codeName: String,
codeCategory: String,
codeDesc: String,
main: String,
commands: String,
code: String, 
});

module.exports = mongoose.model("codes", hm);