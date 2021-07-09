const app = require('express').Router();
const db = require("../../database/models/servers/server.js");
const client = global.clientSL;
const channels = global.config.server.channels;

console.log("[vcodes.xyz/servers]: Index router loaded.");

app.get("/", async (req,res) => {
    res.render("servers/index.ejs", {
        bot: global.clientSL,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        data: await db.find()
	})
})


module.exports = app;
