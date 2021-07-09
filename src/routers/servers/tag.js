const app = require('express').Router();
const db = require("../../database/models/servers/server.js");

console.log("[vcodes.xyz/server]: Tag router loaded.");

app.get("/tag/:tag", async (req, res) => {
    let page = req.query.page || 1;
    let x = await db.find()
    let data = x.filter(a => global.clientSL.guilds.cache.get(a.id) && a.tags.includes(req.params.tag))
    if (page < 1) return res.redirect(`/tag/` + req.params.tag);
    if (data.length <= 0) return res.redirect("/servers");
    if ((page > Math.ceil(data.length / 6))) return res.redirect(`/tag/` + req.params.tag);
    if (Math.ceil(data.length / 6) < 1) {
        page = 1;
    };
    res.render("servers/tag.ejs", {
        bot: global.clientSL,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        page: page,
        data: data
    })
})


module.exports = app;