const mongoose = require("mongoose");
let hm = new mongoose.Schema({
code: String, 
codeName: String,
codeCategory: String,
codeDesc: String,
main: { type: String, default: null },
commands: { type: String, default: null },
});

module.exports = mongoose.model("codes", hm);