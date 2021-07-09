const app = require('express').Router();
const uptimeSchema = require("../../../database/models/uptime.js");
const channels = global.config.server.channels,
	  roles = global.config.server.roles;

console.log("[vcodes.xyz]: Admin/Uptime/Index router loaded.");

app.get("/admin/uptimes", global.checkAuth, async (req, res) => {
    let updata = await uptimeSchema.find();
    res.render("admin/uptimes.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        updata: updata, 
    })
});

app.get("/admin/deleteuptime/:code", global.checkAuth, async (req, res) => {
    await uptimeSchema.deleteOne({
        code: req.params.code
    })
    return res.redirect('../admin/uptimes?error=true&message=Link deleted.');
});

module.exports = app;