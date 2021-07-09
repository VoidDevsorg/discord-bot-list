const app = require('express').Router();
const botsdata = require("../../database/models/botlist/bots.js");

console.log("[vcodes.xyz]: Profile/Edit router loaded.");

const profiledata = require("../../database/models/profile.js");
const client = global.Client;
app.get("/:userID/edit", global.checkAuth, async (req, res) => {
    if(req.params.userID != req.user.id) return res.redirect('/user/'+req.user.id+'/edit');
    client.users.fetch(req.user.id).then(async member => {
        const pdata = await profiledata.findOne({
            userID: member.id
        });
        res.render("profile/profile-edit.ejs", {
        	bot: global.Client,
            path: req.path,
            config: global.config,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            roles:global.config.server.roles,
            channels: global.config.server.channels,
            pdata: pdata,
            member: member
        });
    });
});
app.post("/:userID/edit", global.checkAuth, async (req, res) => {
    let rBody = req.body;
    await profiledata.findOneAndUpdate({
        userID: req.user.id
    }, {
        $set: {
            biography: rBody['biography'],
            website: rBody['website'],
            github: rBody['github'],
            twitter: rBody['twitter'],
            instagram: rBody['instagram']
        }
    }, {
        upsert: true
    })
    return res.redirect('?success=true&message=Your profile has been successfully edited.');
});

module.exports = app;