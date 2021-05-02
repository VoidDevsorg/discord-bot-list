const mongoose = require('mongoose')
const schema = new mongoose.Schema({
user: String,
bot: String,
ms: Number,
Date: Date
})
module.exports = mongoose.model('votes', schema)