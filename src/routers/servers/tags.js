const app = require('express').Router();
const db = require("../../database/models/servers/server.js");
const client = global.clientSL;
const channels = global.config.server.channels;

console.log("[vcodes.xyz/servers]: Tags router loaded.");

app.get("/tags", async (req,res) => {
    res.render("servers/tags.ejs", {
        bot: global.clientSL,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels
	})
})


module.exports = app;
