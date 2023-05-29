const mongoose = require('mongoose')
const schema = new mongoose.Schema({
id: String,
hundred: String,
reason: String,
})
module.exports = mongoose.model('report', schema)