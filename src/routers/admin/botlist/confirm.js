const app = require('express').Router();
const botsdata = require("../../../database/models/botlist/bots.js");
const codesSchema = require("../../../database/models/codes.js");
const uptimedata = require("../../../database/models/uptime.js");
const appsdata = require("../../../database/models/botlist/certificate-apps.js");
let sitedatalari = require("../../../database/models/analytics-site.js");

const roles = global.config.server.roles;
const channels = global.config.server.channels;
const client = global.Client;

console.log("[vcodes.xyz]: Admin/Botlist/Confirm Bot router loaded.");

app.get("/admin/confirm/:botID", global.checkAuth, async (req, res) => {
    const botdata = await botsdata.findOne({
        botID: req.params.botID
    })
    if (!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
    await botsdata.findOneAndUpdate({
        botID: req.params.botID
    }, {
        $set: {
            status: "Approved",
            Date: Date.now(),
        }
    }, function(err, docs) {})
    client.users.fetch(req.params.botID).then(bota => {
        client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named **${bota.tag}** has been approved. `)
        client.users.cache.get(botdata.ownerID).send(`Your bot named **${bota.tag}** has been approved.`)
    });
    let guild = client.guilds.cache.get(config.server.id)
    guild.members.cache.get(botdata.botID).roles.add(roles.botlist.bot);
    guild.members.cache.get(botdata.ownerID).roles.add(roles.botlist.developer);
    if (botdata.coowners) {
        botdata.coowners.map(a => {
            guild.members.cache.get(a).roles.add(roles.botlist.developer);
        })
    }
    return res.redirect(`/admin/unapproved?success=true&message=Bot approved.`)
});

module.exports = app;