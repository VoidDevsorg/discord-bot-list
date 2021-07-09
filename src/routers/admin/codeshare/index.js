const app = require('express').Router();
const codesSchema = require("../../../database/models/codes.js");
const client = global.Client;
const channels = global.config.server.channels,
	  roles = global.config.server.roles;

console.log("[vcodes.xyz]: Admin/CodeShare/Index router loaded.");

app.get("/admin/codes", global.checkAuth, async (req, res) => {
    let koddata = await codesSchema.find();
    res.render("admin/codes.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        koddata: koddata, 
    })
});
app.get("/admin/addcode", global.checkAuth, async (req, res) => {
    res.render("admin/addcode.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels
    })
});
app.get("/admin/editcode/:code", global.checkAuth, async (req, res) => {
    let kod = req.params.code;
    let koddata = await codesSchema.findOne({
        code: kod
    })
    if (!koddata) return res.redirect('/codes?error=true&message=You entered an invalid code.')
    res.render("admin/editcode.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        koddata: koddata, 
    })
});
app.get("/admin/deletecode/:code", global.checkAuth, async (req, res) => {
    await codesSchema.deleteOne({
        code: req.params.code
    })
    return res.redirect('/admin/codes?success=true&message=Code deleted.');
});

module.exports = app;