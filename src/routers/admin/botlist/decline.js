const app = require('express').Router();
const botsdata = require("../../../database/models/botlist/bots.js");
const codesSchema = require("../../../database/models/codes.js");
const uptimedata = require("../../../database/models/uptime.js");
const appsdata = require("../../../database/models/botlist/certificate-apps.js");
let sitedatalari = require("../../../database/models/analytics-site.js");

const roles = global.config.server.roles;
const channels = global.config.server.channels;
const client = global.Client;

console.log("[vcodes.xyz]: Admin/Botlist/Decline Bot router loaded.");

app.post("/admin/decline/:botID", global.checkAuth, async (req, res) => {
    let rBody = req.body;
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    client.users.fetch(botdata.ownerID).then(sahip => {
        client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named **${botdata.username}** has been declined. `)
        client.users.cache.get(botdata.ownerID).send(`Your bot named **${botdata.username}** has been declined.\nReason: **${rBody['reason']}**\nAuthorized: **${req.user.username}**`)
    })
    await botsdata.deleteOne({
        botID: req.params.botID,
        ownerID: botdata.ownerID
    })
    return res.redirect(`/admin/unapproved?success=true&message=Bot declined.`)
});

module.exports = app;