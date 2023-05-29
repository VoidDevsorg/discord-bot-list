const app = require('express').Router();
const serversdata = require("../../../database/models/servers/server.js");
const apps = require("../../../database/models/botlist/report-apps.js");
const client = global.Client;
const Discord = require("discord.js");

console.log("[vcodes.xyz/servers]: Report router loaded.");

app.get("/:guildID/report", global.checkAuth, async (req, res) => {
    const userservers = await serversdata.find({
        id: req.params.guildID
    })
    const checkreporter = await apps.find({
        reporterID: req.user.id
    })
    if (!userservers) return res.redirect('/error?code=401&message=There is no server on our website with this id.');
    let serverdata = await serversdata.findOne({
            id: req.params.guildID
        })
	    res.render("servers/apps/report.ejs", {
	        bot: global.Client,
	        path: req.path,
	        config: global.config,
	        user: req.isAuthenticated() ? req.user : null,
	        req: req,
	        roles: global.config.server.roles,
	        channels: global.config.server.channels,
	        userservers: userservers,
            serverdata: serverdata
	    })
});
app.post("/:guildID/report", global.checkAuth, async (req, res) => {
    const rBody = req.body;
    const checkreporter = await apps.find({
        reporterID: req.user.id
    })
    let findServer = await apps.findOne({ id: req.params.guildID });
    let serverdata = await serversdata.findOne({
            id: req.params.guildID
        })
    await new apps({
        reporterID : req.user.id,
        id: req.params.guildID,
        username: serverdata.username,
        reason: rBody['reason'],
        report: "applied"
    }).save()
    res.redirect("/servers?success=true&message=You have reported the server.&guildID=" + req.params.guildID)
    let reports = await apps.findOne({ botID: req.params.botID });
    const embed = new Discord.EmbedBuilder()
   .setDescription("Report (Server)")
   .setColor("#00ff00")
   .addFields([
        { name: "Reporter", value: req.user.username+'\`` ('+req.user.id+')\``' || "undefined", inline: true },
        { name: "Server ID", value: req.params.guildID || "undefined", inline: true },
        { name: "Username", value: serverdata.username || "undefined", inline: true },
        { name: "Reason:", value: reports.reason || "undefined", inline: true }
   ])
   await client.channels.cache.get(global.config.server.channels.reportlog).send({
        embeds: [embed]
   })
});

module.exports = app;