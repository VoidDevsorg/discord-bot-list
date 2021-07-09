const app = require('express').Router();
const botsdata = require("../../database/models/botlist/bots.js");
const channels = global.config.server.channels,
      roles = global.config.server.roles;

console.log("[vcodes.xyz]: Api router loaded.");

app.get("/api", async (req, res) => {
    res.json({
        "Hello": "World",
        "Template By": "vcodes.xyz",
        "Author": "Claudette"
    });
});
app.get("/api/bots/:botID", async (req, res) => {
    const botinfo = await botsdata.findOne({
        botID: req.params.botID
    })
    if (!botinfo) return res.json({
        "error": "You entered invalid bot id."
    })
    res.json({
        avatar: botinfo.avatar,
        botID: botinfo.botID,
        username: botinfo.username,
        discrim: botinfo.discrim,
        shortDesc: botinfo.shortDesc,
        prefix: botinfo.prefix,
        votes: botinfo.votes,
        ownerID: botinfo.ownerID,
        owner: botinfo.ownerName,
        coowners: botinfo.coowners,
        tags: botinfo.tags,
        longDesc: botinfo.longDesc,
        certificate: botinfo.certificate,
        github: botinfo.github,
        support: botinfo.support,
        website: botinfo.website,
    });
});
app.get("/api/bots/check/:userID", async (req, res) => {
    let token = req.header('Authorization');
    if (!token) return res.json({
        "error": "You must enter a bot token."
    })
    if (!req.params.userID) return res.json({
        "error": "You must enter a user id."
    })
    const botdata = await botsdata.findOne({
        token: token
    })
    if (!botdata) return res.json({
        "error": "You entered an invalid bot token."
    })
    const vote = await voteSchema.findOne({
        bot: botdata.botID,
        user: req.params.userID
    })
    if (vote) {
        res.json({
            voted: true
        });
    } else {
        res.json({
            voted: false
        });
    }
});
app.post("/api/bots/stats", async (req, res) => {
    let token = req.header('Authorization');
    if (!token) return res.json({
        "error": "You must enter a bot token."
    })
    const botdata = await botsdata.findOne({
        token: token
    })
    if (!botdata) return res.json({
        "error": "You entered an invalid bot token."
    })
    if (botdata) {
        await botsdata.updateOne({
            botID: botdata.botID
        }, {
            $set: {
                serverCount: req.header('serverCount')
            }
        })
        if (req.header('shardCount')) {
            await botsdata.updateOne({
                botID: botdata.botID
            }, {
                $set: {
                    shardCount: req.header('shardCount')
                }
            })
        }
    }
});

app.post("/api/search", async (req, res) => {
    let key = req.body.key;
    if (key.length <= 0) return res.json({
        status: true,
        data: []
    });
    let bots = require("../../database/models/botlist/bots.js")
    let bot = await bots.find();
    let data = await bot.filter(d => d.status == "Approved" && d.username.toLowerCase().includes(key.toLowerCase())).sort((a,b) => b.votes - a.votes);
    res.json({
        status: true,
        data: data
    });
});
app.post("/api/search/servers", async (req, res) => {
    let key = req.body.key;
    if (key.length <= 0) return res.json({
        status: true,
        data: []
    });
    let servers = require("../../database/models/servers/server.js")
    let server = await servers.find();
    let data = await server.filter(d => global.clientSL.guilds.cache.get(d.id) && d.name.toLowerCase().includes(key.toLowerCase())).sort((a,b) => global.clientSL.guilds.cache.get(b).memberCount - global.clientSL.guilds.cache.get(a).memberCount);
    res.json({
        status: true,
        data: data
    });
});

module.exports = app;