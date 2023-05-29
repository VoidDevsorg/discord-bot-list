const app = require('express').Router();
const botsdata = require("../../../database/models/botlist/bots.js");
const apps = require("../../../database/models/botlist/report-apps.js");
const client = global.Client;
const Discord = require("discord.js");

console.log("[vcodes.xyz]: Botlist/Report router loaded.");

app.get("/bot/:botID/report", global.checkAuth, async (req, res) => {
    const userbots = await botsdata.find({
        botID: req.params.botID
    })
    const checkreporter = await apps.find({
        reporterID: req.user.id
    })
    if (!userbots) return res.redirect('/error?code=401&message=There is no bot on our website with this id.');
    let botdata = await botsdata.findOne({
            botID: req.params.botID
        })
	    res.render("botlist/apps/report.ejs", {
	        bot: global.Client,
	        path: req.path,
	        config: global.config,
	        user: req.isAuthenticated() ? req.user : null,
	        req: req,
	        roles: global.config.server.roles,
	        channels: global.config.server.channels,
	        userbots: userbots,
          botdata: botdata
	    })
});
app.post("/bot/:botID/report", global.checkAuth, async (req, res) => {
    const rBody = req.body;
    const checkreporter = await apps.find({
        reporterID: req.user.id
    })
    if (rBody['tags'] == "Choose one...") return res.redirect("/error?code=404&message=Please Choose a tag.");
    let findBot = await apps.findOne({ botID: req.params.botID });
    let botdata = await botsdata.findOne({
            botID: req.params.botID
        })
    await new apps({
        reporterID : req.user.id,
        id: req.params.botID,
        username: botdata.username,
        reason: rBody['reason'],
        report: "applied"
    }).save()
    res.redirect("/bots?success=true&message=You have reported the bot.&botID=" + req.params.botID)
    let reports = await apps.findOne({ botID: req.params.botID });
    const embed = new Discord.EmbedBuilder()
   .setDescription("Report (Bot)")
   .setColor("#00ff00")
   .addFields([
        { name: "Reporter", value: req.user.username+'\`` ('+req.user.id+')\``' || "undefined", inline: true },
        { name: "Bot ID", value: req.params.botID || "undefined", inline: true },
        { name: "Username", value: botdata.username || "undefined", inline: true },
        { name: "Reason:", value: reports.reason || "undefined", inline: true }
   ])
   await client.channels.cache.get(global.config.server.channels.reportlog).send({
        embeds: [embed]
   })
});

module.exports = app;