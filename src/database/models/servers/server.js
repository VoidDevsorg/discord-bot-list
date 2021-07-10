const mongoose = require("mongoose");
module.exports = mongoose.model("servers", 
	new mongoose.Schema({
		id: String,
		name: String,
		icon: String,
		ownerID: String,
		longDesc: String,
		shortDesc: String,
		tags: Array,
		link: String,
		bump: {type: Date, default: null},
		votes: {type: Number, default: 0},
		bumps: {type: Number, default: 0},
		analytics: Object,
		analytics_visitors: Number,
		analytics_joins: Number,
		country: Object,
		rates: Object
	})
);
