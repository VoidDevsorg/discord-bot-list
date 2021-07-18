const app = require('express').Router();
const botsdata = require("../../../../database/models/botlist/bots.js");
const codesSchema = require("../../../../database/models/codes.js");
const uptimedata = require("../../../../database/models/uptime.js");
const appsdata = require("../../../../database/models/botlist/certificate-apps.js");
let sitedatalari = require("../../../../database/models/analytics-site.js");

console.log("[vcodes.xyz]: Admin/Botlist/Certificate Give router loaded.");
const roles = global.config.server.roles;
const channels = global.config.server.channels;
const client = global.Client;

app.get("/admin/certificate/give/:botID", global.checkAuth, async (req, res) => {
    await botsdata.findOneAndUpdate({
        botID: req.params.botID
    }, {
        $set: {
            certificate: "Certified",
        }
    }, function(err, docs) {})
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });

    client.users.fetch(botdata.botID).then(bota => {
        client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named **${bota.tag}** has been granted a certificate.`)
        client.users.cache.get(botdata.ownerID).send(`Your bot named **${bota.tag}** has been certified.`)
    });
    await appsdata.deleteOne({
        botID: req.params.botID
    })
    let guild = client.guilds.cache.get(config.server.id)
    guild.members.cache.get(botdata.botID).roles.add(roles.botlist.certified_bot);
    guild.members.cache.get(botdata.ownerID).roles.add(roles.botlist.certified_developer);
    if (botdata.coowners) {
        botdata.coowners.map(a => {
            if (guild.members.cache.get(a)) {
                guild.members.cache.get(a).roles.add(roles.botlist.certified_developer);
            }
        })
    }
    return res.redirect(`/admin/certificate-apps?success=true&message=Certificate gived.&botID=${req.params.botID}`)
});

module.exports = app;
