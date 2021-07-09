const app = require('express').Router();
const codesSchema = require("../../database/models/codes.js");
const client = global.Client;

console.log("[vcodes.xyz]: Code Share/View router loaded.");

app.get("/view/:code", global.checkAuth, async (req, res) => {
    let kod = req.params.code;
    let koddata = await codesSchema.findOne({
        code: kod
    })
    if (!koddata) return res.redirect('/codes/list?error=true&message=You entered an invalid code.')
    if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id)) return res.redirect("/error?code=403&message=To do this, you have to join our discord server.");
    if (koddata.codeCategory == "javascript") {
        if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.javascript)) return res.redirect("/error?code=403&message=You is not competent to do this.");
    }
    if (koddata.codeCategory == "html") {
        if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.html)) return res.redirect("/error?code=403&message=You is not competent to do this.");
    }
    if (koddata.codeCategory == "subs") {
        if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.substructure)) return res.redirect("/error?code=403&message=You is not competent to do this.");
    }
    if (koddata.codeCategory == "5invites") {
        if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.fiveInvite)) return res.redirect("/error?code=403&message=You is not competent to do this.");
    }
    if (koddata.codeCategory == "10invites") {
        if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.tenInvite)) return res.redirect("/error?code=403&message=You is not competent to do this.");
    }
    if (koddata.codeCategory == "15invites") {
        if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.fifteenInvite)) return res.redirect("/error?code=403&message=You is not competent to do this.");
    }
    if (koddata.codeCategory == "20invites") {
        if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.twentyInvite)) return res.redirect("/error?code=403&message=You is not competent to do this.");
    }
    if (koddata.codeCategory == "bdfd") {
        if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.bdfd)) return res.redirect("/error?code=403&message=You is not competent to do this.");
    }
    res.render("codeshare/codeview.ejs", {
        bot: global.Client,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        koddata: koddata
    });
})


module.exports = app;