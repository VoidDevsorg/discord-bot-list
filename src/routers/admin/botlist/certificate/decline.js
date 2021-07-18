const app = require('express').Router();
const botsdata = require("../../../../database/models/botlist/bots.js");
const codesSchema = require("../../../../database/models/codes.js");
const uptimedata = require("../../../../database/models/uptime.js");
const appsdata = require("../../../../database/models/botlist/certificate-apps.js");
let sitedatalari = require("../../../../database/models/analytics-site.js");

console.log("[vcodes.xyz]: Admin/Botlist/Certificate Decline router loaded.");
const roles = global.config.server.roles;
const channels = global.config.server.channels;
const client = global.Client;
app.post("/admin/certificate/delete/:botID", global.checkAuth, async (req, res) => {
    let rBody = req.body;
    await botsdata.findOneAndUpdate({
        botID: req.params.botID
    }, {
        $set: {
            certificate: "None",
        }
    }, function(err, docs) {})
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    client.users.fetch(botdata.botID).then(bota => {
        client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named **${bota.tag}** has not been granted a certificate.`)
        client.users.cache.get(botdata.ownerID).send(`Your bot named **${bota.tag}** certificate application has been declined.\nReason: **${rBody['reason']}**`)
    });
    await appsdata.deleteOne({
        botID: req.params.botID
    })
    let guild = client.guilds.cache.get(config.server.id)
    guild.members.cache.get(botdata.botID).roles.remove(roles.botlist.certified_bot);
    guild.members.cache.get(botdata.ownerID).roles.remove(roles.botlist.certified_developer);
    return res.redirect(`/admin/certificate-apps?success=true&message=Certificate deleted.`)
});

module.exports = app;
