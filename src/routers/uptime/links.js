const app = require('express').Router();
const path = require("path");
const uptimedata = require("../../database/models/uptime.js");
const roles = global.config.server.roles,
      channels = global.config.server.channels;
const client = global.Client;
const Discord = require("discord.js");

console.log("[vcodes.xyz]: Uptime/Links router loaded.");

app.get("/links", global.checkAuth, async (req,res) => {
    let uptimes = await uptimedata.find({ userID: req.user.id })
    res.render("uptime/links.ejs", {
        bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        uptimes: uptimes,
        roles: global.config.server.roles,
        channels: global.config.server.channels,
        data: uptimedata
    })
})


module.exports = app;