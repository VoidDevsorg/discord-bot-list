const app = require('express').Router();
const db = require("../../../database/models/servers/server.js");
const botsdb = require("../../../database/models/botlist/bots.js");
const client = global.clientSL;
const channels = global.config.server.channels;
const clientTwo = global.Client;
console.log("[vcodes.xyz/servers]: View router loaded.");

app.get("/:guildID", async (req,res) => {
    let sdb = await db.findOne({ id: req.params.guildID });
    if(!req.params.guildID) return res.redirect('/servers');
    if(!sdb) return res.redirect('/servers');
    let page = req.query.page || 1;
    let data = sdb.rates || [];
    if ((page > Math.ceil(data.length / 5))) {
        page = 1;
    }
    if (Math.ceil(data.length / 5) < 1) {
        page = 1;
    };
	let checkGuild = global.clientSL.guilds.cache.get(req.params.guildID);
	if(!checkGuild) return res.redirect('/servers');

    let sdata = await db.findOne({ id: req.params.guildID });
    let rateAuthors = new Array();
    (sdata.rates || []).map(x => {
        rateAuthors.push(client.users.cache.get(x.author))
    })
    /* ANALYTICS */
        let referresURL = String(req.headers.referer).replace("undefined", "Unkown").split('.').join(',');
        await db.updateOne({
            id: req.params.guildID
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
            await db.updateOne({
                id: req.params.guildID
            }, {
                $inc: {
                    [`country.${CountryCode}`]: 1
                }
            })
        }
        await db.updateOne({
            id: req.params.guildID
        }, {
            $inc: {
                [`analytics.${referresURL}`]: 1
            }
        })
        
    res.render("servers/server/view.ejs", {
        bot: global.clientSL,
        path: req.path,
        config: global.config,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        roles:global.config.server.roles,
        channels: global.config.server.channels,
        data: data,
        guildGet: checkGuild,
        page: page,
        sdb: sdb,
        rateAuthors: rateAuthors,
        moment: require("moment")
	})
})

module.exports = app;
