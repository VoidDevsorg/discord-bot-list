const app = require('express').Router();
const codesSchema = require("../../database/models/codes.js");

console.log("[vcodes.xyz]: Code Share/List router loaded.");

app.get("/list/:type", global.checkAuth, async (req, res) => {

    res.render("codeshare/codes/codelist.ejs", {
        bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        data: await codesSchema.find()
    });
})


module.exports = app;