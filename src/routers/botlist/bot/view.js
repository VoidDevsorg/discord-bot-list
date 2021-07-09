const app = require('express').Router();
const botsdata = require("../../../database/models/botlist/bots.js");
const client = global.Client;

console.log("[vcodes.xyz]: Botlist/Bot view router loaded.");
app.get("/bot/:botID", async (req, res, next) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
    if (botdata.status != "Approved") {
        if(!req.user) return res.redirect('/');
        if (req.user.id == botdata.ownerID || botdata.coowners.includes(req.user.id)) {
            let coowner = new Array()
            botdata.coowners.map(a => {
                client.users.fetch(a).then(b => coowner.push(b))
            })
            client.users.fetch(botdata.ownerID).then(aowner => {
                client.users.fetch(req.params.botID).then(abot => {
                    res.render("botlist/bot/bot.ejs", {
                        bot: global.Client,
                        path: req.path,
                        config: global.config,
                        user: req.isAuthenticated() ? req.user : null,
                        req: req,
                        roles:global.config.server.roles,
                        channels: global.config.server.channels,
                        aowner: aowner,
                        coowner: coowner,
                        abot: abot,
                        botdata: botdata
                    })
                });
            });
        } else {
            res.redirect("/error?code=404&message=To edit this bot, you must be one of its owners.");
        }
    } else {
        let coowner = new Array()
        botdata.coowners.map(a => {
            client.users.fetch(a).then(b => coowner.push(b))
        })

        let referresURL = String(req.headers.referer).replace("undefined", "Unkown").split('.').join(',');
        await botsdata.updateOne({
            botID: req.params.botID
        }, {
            $inc: {
                analytics_visitors: 1
            }
        })

        var getIP = require('ipware')().get_ip;
        var ipInfo = getIP(req);
        var geoip = require('geoip-lite');
        var ip = ipInfo.clientIp;
        var geo = geoip.lookup(ip);

        if (geo) {
            let CountryCode = geo.country || "TR"
            await botsdata.updateOne({
                botID: req.params.botID
            }, {
                $inc: {
                    [`country.${CountryCode}`]: 1
                }
            })
        }
        await botsdata.updateOne({
            botID: req.params.botID
        }, {
            $inc: {
                [`analytics.${referresURL}`]: 1
            }
        })

        let rateAuthors = new Array();
        (botdata.rates || []).map(x => {
            client.users.fetch(x.author).then(b => rateAuthors.push(b))
        })
        let page = req.query.page || 1;
        let data = botdata.rates || [];
        if ((page > Math.ceil(data.length / 5))) {
            page = 1;
        }
        if (Math.ceil(data.length / 5) < 1) {
            page = 1;
        };
        client.users.fetch(botdata.ownerID).then(aowner => {
            client.users.fetch(req.params.botID).then(abot => {
                    res.render("botlist/bot/bot.ejs", {
                        bot: global.Client,
                        path: req.path,
                        config: global.config,
                        user: req.isAuthenticated() ? req.user : null,
                        req: req,
                        roles:global.config.server.roles,
                        channels: global.config.server.channels,
                        aowner: aowner,
                        coowner: coowner,
                        rateAuthors: rateAuthors,
                        moment: require("moment"),
                        abot: abot,
                        page: page,
                        data: data,
                        botdata: botdata
                    })
            });
        });

    }
});
app.get("/bot/:botID/invite", global.checkAuth, async (req, res) => {
        await botsdata.updateOne({
            botID: req.params.botID
        }, {
            $inc: {
                analytics_invites: 1
            }
        })
    return res.redirect('https://discord.com/oauth2/authorize?client_id='+req.params.botID+'&permissions=8&scope=bot');
})
app.post("/bot/:botID", global.checkAuth, async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    client.users.fetch(botdata.botID).then(async bot => {
        client.users.fetch(botdata.ownerID).then(async owner => {
            if (bot) {
                await botsdata.findOneAndUpdate({
                    botID: botdata.botID
                }, {
                    $set: {
                        ownerName: owner.username,
                        username: bot.username,
                        discrim: bot.discriminator,
                        avatar: bot.avatarURL()
                    }
                })
            } else {
                await botsdata.findOneAndDelete({
                    botID: botdata.botID
                })
            }
        })
    })
    return res.redirect('/bot/' + req.params.botID);
})

app.post("/bot/:botID/new-comment", async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.send({
        error: "You entered an invalid bot id."
    });
    if (!req.body.rating) {
        await botsdata.updateOne({
            botID: req.params.botID
        }, {
            $push: {
                rates: {
                    author: req.user.id,
                    star_rate: 1,
                    message: req.body.content,
                    date: Date.now()
                }
            }
        })
    } else {
        await botsdata.updateOne({
            botID: req.params.botID
        }, {
            $push: {
                rates: {
                    author: req.user.id,
                    star_rate: req.body.rating,
                    message: req.body.content,
                    date: Date.now()
                }
            }
        })
    }

    return res.redirect('/bot/' + req.params.botID);
})
app.post("/bot/:botID/reply/:userID", async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.send({
        error: "You entered an invalid bot id."
    });
    if (!req.params.userID) return res.send({
        error: "You must enter a user id."
    })
    let message = req.body.replyM;
    if(!message) return res.send({
        error: "You must enter a reply message."
    })
    await botsdata.update({ 
            botID: req.params.botID,
            'rates.author': req.params.userID
        }, {
            $set: {
                'rates.$.reply': message
            }
    }, function(err, person) { if(err) return console.log(err); })
    return res.redirect('/bot/' + req.params.botID);
})

app.post("/bot/:botID/edit/:userID", async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.send({
        error: "You entered an invalid bot id."
    });
    if (!req.params.userID) return res.send({
        error: "You must enter a user id."
    })
    let message = req.body.editM;
    if(!message) return res.send({
        error: "You must enter a edit message."
    })
    await botsdata.update({ 
            botID: req.params.botID,
            'rates.author': req.params.userID
        }, {
            $set: {
                'rates.$.star_rate': req.body.ratingEdit,
                'rates.$.edit': message
            }
    }, function(err, person) { if(err) return console.log(err); })
    return res.redirect('/bot/' + req.params.botID);
})
app.post("/bot/:botID/reply/:userID/edit", async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.send({
        error: "You entered an invalid bot id."
    });
    if (!req.params.userID) return res.send({
        error: "You must enter a user id."
    })
    let message = req.body.editReplyM;
    if(!message) return res.send({
        error: "You must enter a new reply message."
    })
    await botsdata.update({ 
            botID: req.params.botID,
            'rates.author': req.params.userID
        }, {
            $set: {
                'rates.$.reply': message
            }
    }, function(err, person) { if(err) return console.log(err); })
    return res.redirect('/bot/' + req.params.botID);
})
app.post("/bot/:botID/reply/:userID/delete", async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.send({
        error: "You entered an invalid bot id."
    });
    if (!req.params.userID) return res.send({
        error: "You must enter a user id."
    })
    await botsdata.update({ 
            botID: req.params.botID,
            'rates.author': req.params.userID
        }, {
            $unset: {
                'rates.$.reply': null
            }
    }, function(err, person) { if(err) return console.log(err); })
    return res.redirect('/bot/' + req.params.botID);
})
app.post("/bot/:botID/review/:userID/delete", async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    });
    if (!botdata) return res.send({
        error: "You entered an invalid bot id."
    });
    if (!req.params.userID) return res.send({
        error: "You must enter a user id."
    })
    await botsdata.update({ 
            botID: req.params.botID,
            'rates.author': req.params.userID
        }, {
            $unset: {
                'rates.$.author': null,
                'rates.$.star_rate': null,
                'rates.$.message': null,
                'rates.$.date': null,
                'rates.$.edit': null,
                'rates.$.reply': null
            }
    }, function(err, person) { if(err) return console.log(err); })
    return res.redirect('/bot/' + req.params.botID);
})
app.get("/bot/:botID/delete", async (req, res) => {
    let botdata = await botsdata.findOne({
        botID: req.params.botID
    })
    if (req.user.id === botdata.ownerID || botdata.coowners.includes(req.user.id)) {
        let guild = client.guilds.cache.get(config.server.id).members.cache.get(botdata.botID);
        await botsdata.deleteOne({
            botID: req.params.botID,
            ownerID: botdata.ownerID
        })
        return res.redirect(`/user/${req.user.id}?success=true&message=Bot succesfully deleted.`)

    } else {
        return res.redirect("/error?code=404&message=You entered an invalid bot id.");
    }
})
module.exports = app;