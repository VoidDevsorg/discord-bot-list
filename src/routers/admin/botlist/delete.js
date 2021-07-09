const app = require('express').Router();
const botsdata = require("../../../database/models/botlist/bots.js");
const codesSchema = require("../../../database/models/codes.js");
const uptimedata = require("../../../database/models/uptime.js");
const appsdata = require("../../../database/models/botlist/certificate-apps.js");
let sitedatalari = require("../../../database/models/analytics-site.js");


const roles = global.config.server.roles;
const channels = global.config.server.channels;
const client = global.Client;

console.log("[vcodes.xyz]: Admin/Botlist/Delete Bot router loaded.");

app.get("/admin/delete/:botID", global.checkAuth, async (req, res) => {
    const botdata = await botsdata.findOne({
        botID: req.params.botID
    })
    if (!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
    let guild = client.guilds.cache.get(config.server.id)
    guild.members.cache.get(botdata.botID).roles.remove(roles.bot);
    await guild.members.cache.get(botdata.botID).kick();
    await botsdata.deleteOne({
        botID: req.params.botID,
        ownerID: botdata.ownerID
    })
    return res.redirect(`/admin/approved?success=true&message=Bot deleted.`)
});

module.exports = app;