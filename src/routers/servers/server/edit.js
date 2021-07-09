const app = require('express').Router();
const sdata = require("../../../database/models/servers/server.js");
const client = global.clientSL;
const channels = global.config.server.channels;

console.log("[vcodes.xyz/servers]: Edit router loaded.");

app.get("/:guildID/edit", global.checkAuth, async (req, res) => {
    let serverData = await sdata.findOne({
        id: req.params.guildID
    });
    if (!serverData) return res.redirect("/error?code=404&message=You entered an invalid server id.");

    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/error?code=404&message=You entered an invalid server id.");
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        try {
            await guild.members.fetch();
            member = guild.members.cache.get(req.user.id);
        } catch (err) {
            res.send({
                error: true,
                message: `Couldn't fetch the members of ${guild.id}: ${err}`
            })
        }
    }
    if (!member) return res.redirect("/error?code=403&message=Unauthorized.");
    if (!member.permissions.has("ADMINISTRATOR")) return res.redirect("/error?code=403&message=Unauthorized.");
    res.render("servers/server/edit.ejs", {
        bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles: global.config.server.roles,
        channels: global.config.server.channels,
        data: serverData
    })
});


app.post("/:guildID/edit", global.checkAuth, async (req, res) => {
    let serverData = await sdata.findOne({
        id: req.params.guildID
    });
    if (!serverData) return res.redirect("/error?code=404&message=You entered an invalid server id.");
    let {
        link,
        shortDesc,
        longDesc,
        tags,
        autoCreate
    } = req.body;
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!req.params.guildID || !longDesc || !shortDesc || !tags) return res.send({
        error: true,
        message: "Fill the must any blanks."
    });
        if(!link && !autoCreate) return res.send({ error: true, message: "Fill the must any blanks."});
    if (!guild) {
        await sdata.deleteOne({
            id: req.params.guildID
        })
        return res.send({
            error: true,
            message: "Server deleted on system because you kicked me."
        });
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        try {
            await guild.members.fetch();
            member = guild.members.cache.get(req.user.id);
        } catch (err) {
            res.send({
                error: true,
                message: `Couldn't fetch the members of ${guild.id}: ${err}`
            })
        }
    }
    if (!member) return res.redirect(
    	'/error?code=403&message=You can only edit servers with ADMINISTRATOR authorization.'
    );
    if (!member.permissions.has("ADMINISTRATOR")) return res.redirect(
    	'/error?code=403&message=You can only edit servers with ADMINISTRATOR authorization.'
    );
    await sdata.findOneAndUpdate({
        id: req.params.guildID
    }, {
        $set: {
            name: guild.name,
            icon: guild.iconURL({ dynamic: true }),
            ownerID: guild.owner.id ? guild.owner.id : req.user.id,
            longDesc: longDesc,
            shortDesc: shortDesc,
            tags: tags
        }
    }, { upsert: true })
    if(autoCreate === "true") {
    guild.fetchInvites().then(async fetchinvite => {
      fetchinvite.array().find(a => a.inviter.id === client.user.id)
        ? fetchinvite.array().find(a => a.inviter.id === client.user.id).code
        : await guild.channels.cache.random().createInvite({ maxAge: 0 });
    });
    guild.fetchInvites().then(async fetchinvite => {
      let inviteURL = fetchinvite
        .array()
        .find(a => a.inviter.id === client.user.id).url;
    await sdata.findOneAndUpdate({
        id: req.params.guildID
    }, {
        $set: {
            link: inviteURL
        }
    }, { upsert: true })
    })

    } else {
    await sdata.findOneAndUpdate({
        id: req.params.guildID
    }, {
        $set: {
            link: req.body.link
        }
    }, { upsert: true })
    }

    return res.send({
        success: true,
        message: "Server succesfuly edited."
    });
})

module.exports = app;