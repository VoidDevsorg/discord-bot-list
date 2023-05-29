const mongoose = require("mongoose");
let hm = new mongoose.Schema({
  code: { type: String, default: null },
  icon: { type: String, default: null },
  ownerID: { type: String, default: null },
  serverName: { type: String, default: null },
  website: { type: String, default: null },
  description: { type: String, default: null },
});

module.exports = mongoose.model("partners", hm);
