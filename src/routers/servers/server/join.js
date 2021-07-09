const app = require('express').Router();
const db = require("../../../database/models/servers/server.js");
const client = global.clientSL;
const channels = global.config.server.channels;

console.log("[vcodes.xyz/servers]: Join router loaded.");

app.get("/:guildID/join", async (req,res) => {
	let data = await db.findOne({ id: req.params.guildID });
	if(!data) return res.redirect('/servers');
	if(!client.guilds.cache.get(data.id)) return res.redirect('/servers');
	let guild = client.guilds.cache.get(data.id);
    await db.updateOne({
                id: req.params.guildID
            }, {
                $inc: {
                    analytics_joins: 1
                }
    }
    )
	let urlInvite = data.link;
    res.render("servers/server/join.ejs", {
        bot: global.clientSL,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        data: data,
        inviteURL: urlInvite

	})
})


module.exports = app;
