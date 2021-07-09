const app = require('express').Router();
const botsdata = require("../../database/models/botlist/bots.js");

console.log("[vcodes.xyz]: Botlist/Mini router loaded.");

app.get("/certification", async (req, res) => {
    res.render("botlist/apps/certification.ejs", {
        bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels
    })
})

app.get("/bot-rules", async (req, res) => {
    res.render("botlist/bot-rules.ejs", {
        bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels
    })
})

app.get("/bots", async (req, res) => {
    let page = req.query.page || 1;
    let data = await botsdata.find() || await botsdata.find().filter(b => b.status === "Approved")
    if (page < 1) return res.redirect(`/bots`);
    if (data.length <= 0) return res.redirect("/");
    if ((page > Math.ceil(data.length / 6))) return res.redirect(`/bots`);
    if (Math.ceil(data.length / 6) < 1) {
        page = 1;
    };
    res.render("botlist/bots.ejs", {
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

app.get("/bots/certified", async (req, res) => {
    let page = req.query.page || 1;
    let x = await botsdata.find()
    let data = x.filter(b => b.certificate === "Certified")
    if (page < 1) return res.redirect(`/bots`);
    if (data.length <= 0) return res.redirect("/");
    if ((page > Math.ceil(data.length / 6))) return res.redirect(`/bots`);
    if (Math.ceil(data.length / 6) < 1) {
        page = 1;
    };
    res.render("botlist/bots-certified.ejs", {
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

app.get("/search", async (req, res) => {
    let page = req.query.page || 1;
    let x = await botsdata.find()
    let data = x.filter(a => a.status == "Approved" && a.username.includes(req.query.q) || a.shortDesc.includes(req.query.q))
    if (page < 1) return res.redirect(`/bots`);
    if (data.length <= 0) return res.redirect("/");
    if ((page > Math.ceil(data.length / 6))) return res.redirect(`/bots`);
    if (Math.ceil(data.length / 6) < 1) {
        page = 1;
    };
    res.render("botlist/search.ejs", {
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

app.get("/tags", async (req, res) => {
    res.render("botlist/tags.ejs", {
        bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
    })
})

app.get("/tag/:tag", async (req, res) => {
    let page = req.query.page || 1;
    let x = await botsdata.find()
    let data = x.filter(a => a.status == "Approved" && a.tags.includes(req.params.tag))
    if (page < 1) return res.redirect(`/tag/` + req.params.tag);
    if (data.length <= 0) return res.redirect("/");
    if ((page > Math.ceil(data.length / 6))) return res.redirect(`/tag/` + req.params.tag);
    if (Math.ceil(data.length / 6) < 1) {
        page = 1;
    };
    res.render("botlist/tag.ejs", {
        bot: global.Client,
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