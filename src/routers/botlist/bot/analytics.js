const app = require('express').Router();
const botsdata = require("../../../database/models/botlist/bots.js");
const client = global.Client;
const channels = global.config.server.channels;

console.log("[vcodes.xyz]: Botlist/Analytics router loaded.");

app.get("/bot/:botID/analytics", global.checkAuth, async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.")
    if (req.user.id == botdata.ownerID || botdata.coowners.includes(req.user.id)) {
	    res.render("botlist/bot/bot-analytics.ejs", {
	        bot: global.Client,
	        path: req.path,
	        config: global.config,
	        user: req.isAuthenticated() ? req.user : null,
	        req: req,
	        roles:global.config.server.roles,
	        channels: global.config.server.channels,
	        botdata: botdata
	    });
    } else {
        return res.redirect("/error?code=404&message=You entered an invalid bot id.");
    }
});

module.exports = app;