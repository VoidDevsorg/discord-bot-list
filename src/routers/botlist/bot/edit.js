const app = require('express').Router();
const botsdata = require("../../../database/models/botlist/bots.js");
const client = global.Client;
const channels = global.config.server.channels;

console.log("[vcodes.xyz]: Botlist/Edit router loaded.");

app.get("/bot/:botID/edit", global.checkAuth, async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.")
    if (req.user.id == botdata.ownerID || botdata.coowners.includes(req.user.id)) {
	    res.render("botlist/bot/bot-edit.ejs", {
	        bot: global.Client,
	        path: req.path,
	        config: global.config,
	        user: req.isAuthenticated() ? req.user : null,
	        req: req,
	        roles:global.config.server.roles,
	        channels: global.config.server.channels,
	        botdata: botdata
	    })
    } else {
        res.redirect("/error?code=404&message=To edit this bot, you must be one of its owners.");
    }
});


app.post("/bot/:botID/edit", global.checkAuth, async (req, res) => {
    let rBody = req.body;
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    })
    if (String(rBody['coowners']).split(',').length > 3) return res.redirect("?error=true&message=You can add up to 3 CO-Owners..")
    if (String(rBody['coowners']).split(',').includes(req.user.id)) return res.redirect("?error=true&message=You cannot add yourself to other CO-Owners.");
    await botsdata.findOneAndUpdate({
        botID: req.params.botID
    }, {
        $set: {
            botID: req.params.botID,
            ownerID: botdata.ownerID,
            prefix: rBody['prefix'],
            longDesc: rBody['longDesc'],
            shortDesc: rBody['shortDesc'],
            tags: rBody['tags'],
            github: rBody['github'],
            website: rBody['website'],
            support: rBody['support'],
            coowners: String(rBody['coowners']).split(','),
            backURL: rBody['background'],
        }
    }, function(err, docs) {})
    client.users.fetch(req.params.botID).then(a => {
        client.channels.cache.get(channels.botlog).send(`<@${req.user.id}> edited **${a.tag}**`)
        res.redirect(`?success=true&message=Your bot has been successfully edited.&botID=${req.params.botID}`)
    })
})

module.exports = app;