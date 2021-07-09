const app = require('express').Router();
const codesSchema = require("../../database/models/codes.js");

console.log("[vcodes.xyz]: Code Share/Categories router loaded.");

app.get("/categories", global.checkAuth, async (req, res) => {

    res.render("codeshare/codes/categories.ejs", {
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