const app = require('express').Router();
const botsdata = require("../../database/models/botlist/bots.js");
const codesSchema = require("../../database/models/codes.js");
const uptimedata = require("../../database/models/uptime.js");
const appsdata = require("../../database/models/botlist/certificate-apps.js");
let sitedatalari = require("../../database/models/analytics-site.js");



console.log("[vcodes.xyz]: Admin/Index router loaded.");
app.get("/admin", global.checkAuth, async (req, res) => {
	const botdata = await botsdata.find();
	const codedata = await codesSchema.find();
	const udata = await uptimedata.find();
	let siteD = await sitedatalari.findOne({ id: config.website.clientID });
    res.render("admin/index.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        codedata: codedata,
        botdata: botdata, 
        udata: udata, 
        siteD: siteD
    })
});
app.get("/admin/unapproved", global.checkAuth, async (req, res) => {
	const botdata = await botsdata.find();
    res.render("admin/unapproved.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        botdata: botdata, 
    })
});
app.get("/admin/approved", global.checkAuth, async (req, res) => {
	const botdata = await botsdata.find();
    res.render("admin/approved.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        botdata: botdata, 
    })
});
app.get("/admin/certificate-apps", checkAuth, async (req, res) => {
	const botdata = await botsdata.find();
    const apps = await appsdata.find()
    res.render("admin/certificate-apps.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        botdata: botdata, 
        apps: apps
    })
});
app.get("/admin/decline/:botID", global.checkAuth, async (req, res) => {
    const botdata = await botsdata.findOne({ botID: req.params.botID })
    if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
    res.render("admin/decline.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        botdata: botdata
    })
});

app.get("/admin/certified-bots", global.checkAuth, async (req, res) => {
    const botdata = await botsdata.find();
    res.render("admin/certified-bots.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        botdata: botdata
    })
});
app.get("/admin/certificate/delete/:botID", global.checkAuth, async (req, res) => {
    const botdata = await botsdata.findOne({
        botID: req.params.botID
    })
    if (!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
    res.render("admin/certificate-delete.ejs", {
    	bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        botdata: botdata
    })
});
module.exports = app;