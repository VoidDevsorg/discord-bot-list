const app = require('express').Router();
const db = require("../../database/models/servers/server.js");

console.log("[vcodes.xyz/servers]: Search router loaded.");

app.get("/search", async (req, res) => {
    let page = req.query.page || 1;
    let x = await db.find()
    let data = x.filter(a => global.clientSL.guilds.cache.get(a.id) && a.name.includes(req.query.q) || a.shortDesc.includes(req.query.q))
    if (page < 1) return res.redirect(`/bots`);
    if (data.length <= 0) return res.redirect("/");
    if ((page > Math.ceil(data.length / 6))) return res.redirect(`/bots`);
    if (Math.ceil(data.length / 6) < 1) {
        page = 1;
    };
    res.render("servers/search.ejs", {
        bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        data: data,
        page: page
    })
})




module.exports = app;