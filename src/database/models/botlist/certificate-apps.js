const mongoose = require('mongoose')
const schema = new mongoose.Schema({
botID: String,
hundred: String,
future: String,
})
module.exports = mongoose.model('certificate-apps', schema)