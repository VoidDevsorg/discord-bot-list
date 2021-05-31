
  const url = require("url");
  const path = require("path");
  const express = require("express");
  const passport = require("passport");
  const session = require("express-session");
  const Strategy = require("passport-discord").Strategy;
  const ejs = require("ejs");
  const bodyParser = require("body-parser");
  const Discord = require("discord.js");
  const config = require("../config.js");
  const roles = config.server.roles;
  const channels = config.server.channels;
  const app = express();
  const MemoryStore = require("memorystore")(session);
  const fetch = require("node-fetch");
  const cookieParser = require('cookie-parser');
  const referrerPolicy = require('referrer-policy');
  app.use(referrerPolicy({ policy: "strict-origin" }))
  // MODELS
  const botsdata = require("./database/models/botlist/bots.js");
  const voteSchema = require("./database/models/botlist/vote.js");
  const codesSchema = require("./database/models/codes.js");
  const uptimeSchema = require("./database/models/uptime.js");
  const banSchema = require("./database/models/site-ban.js");
  const maintenceSchema = require('./database/models/bakim.js');

  module.exports = async (client) => {
    const templateDir = path.resolve(`${process.cwd()}${path.sep}src/views`);
    app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}assets/css`)));
    app.use("/js", express.static(path.resolve(`${templateDir}${path.sep}assets/js`)));
    app.use("/img", express.static(path.resolve(`${templateDir}${path.sep}assets/img`)));
  
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
  
    passport.use(new Strategy({
      clientID: config.website.clientID,
      clientSecret: config.website.secret,
      callbackURL: config.website.callback,
      scope: ["identify", "guilds", "guilds.join"]
    },
    (accessToken, refreshToken, profile, done) => { 
      process.nextTick(() => done(null, profile));
    }));
  
    app.use(session({
      store: new MemoryStore({ checkPeriod: 86400000 }),
      secret: "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
      resave: false,
      saveUninitialized: false,
    }));
  
    app.use(passport.initialize());
    app.use(passport.session());
  
  
    app.engine("html", ejs.renderFile);
    app.set("view engine", "html");
  
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));
  
  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      _token: req.session['_token'],
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
    };
  
    const checkAuth = (req, res, next) => {
      if (req.isAuthenticated()) return next();
      req.session.backURL = req.url;
      res.redirect("/login");
    }
    
    const checkMaintence = async (req, res, next) => {
      const d = await maintenceSchema.findOne({server: config.server.id });
      if(d) {
          if(req.isAuthenticated()) {
              let usercheck = client.guilds.cache.get(config.server.id).members.cache.get(req.user.id);
              if(usercheck) {
                  if(usercheck.roles.cache.get(roles.yonetici)) {
                  next();
                  } else {
                      res.redirect('/error?code=200&message=Our website is temporarily unavailable.') 
                  }
              } else {
                  res.redirect('/error?code=200&message=Our website is temporarily unavailable.') 
              }
          } else {
              res.redirect('/error?code=200&message=Our website is temporarily unavailable.') 
          }
      } else {
          next();
      }
    }
    
    function generateRandom(length) {
        var result           = [];
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
       }
       return result.join('');
    }
    


   app.get("/login", (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL; 
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = "/";
       }
      next();
    },
    passport.authenticate("discord", { prompt: 'none' }));
    app.get("/callback", passport.authenticate("discord", { failureRedirect: "/error?code=999&message=We encountered an error while connecting." }), async (req, res) => {
        let banned = await banSchema.findOne({user: req.user.id})
        if(banned) {
        client.users.fetch(req.user.id).then(async a => {
        client.channels.cache.get(channels.login).send(new Discord.MessageEmbed().setAuthor(a.username, a.avatarURL({dynamic: true})).setThumbnail(a.avatarURL({dynamic: true})).setColor("RED").setDescription(`[**${a.username}**#${a.discriminator}](https://vcodes.xyz/user/${a.id}) isimli kullanıcı **siteye** giriş yapmaya çalıştı fakat siteden engellendiği için giriş yapamadı.`).addField("Username", a.username).addField("User ID", a.id).addField("User Discriminator", a.discriminator))
        })
        req.session.destroy(() => {
        res.json({ login: false, message: "You have been blocked from vCodes.", logout: true })
        req.logout();
        });
        } else {
            try {
              const request = require('request');
              request({
                  url: `https://discordapp.com/api/v8/guilds/${config.server.id}/members/${req.user.id}`,
                  method: "PUT",
                  json: { access_token: req.user.accessToken },
                  headers: { "Authorization": `Bot ${client.token}` }
              });
        } catch {};
        res.redirect(req.session.backURL || '/')
        client.users.fetch(req.user.id).then(async a => {
        client.channels.cache.get(channels.login).send(new Discord.MessageEmbed().setAuthor(a.username, a.avatarURL({dynamic: true})).setThumbnail(a.avatarURL({dynamic: true})).setColor("GREEN").setDescription(`[**${a.username}**#${a.discriminator}](https://vcodes.xyz/user/${a.id}) isimli kullanıcı **siteye** giriş yaptı.`).addField("Username", a.username).addField("User ID", a.id).addField("User Discriminator", a.discriminator))
        
        })
        }
    });
    app.get("/logout", function (req, res) {
      req.session.destroy(() => {
        req.logout();
        res.redirect("/");
      });
    });

    const http = require('http').createServer(app);
    const io = require('socket.io')(http);
    io.on('connection', socket => {
      io.emit("userCount", io.engine.clientsCount);
    }); 
    http.listen(3000);
    //------------------- EXTRA -------------------//


    app.get("/", checkMaintence, async (req, res) => {
      const botdata = await botsdata.find();
      renderTemplate(res, req, "index.ejs", { config, roles, botdata, getuser });
    });
    app.get("/dc", (req, res) => {
      res.redirect('https://discord.gg/z7dBzygse4');
    });  
    app.get("/discord", (req, res) => {
      res.redirect('https://discord.gg/z7dBzygse4');
    });  
    app.get("/error", (req, res) => {
          renderTemplate(res, req, "pages/error.ejs", {req, config, res, roles, channels});
    });
    app.get("/team", checkMaintence, (req, res) => {
        renderTemplate(res, req, "team.ejs", {req, roles, config});
      });
    app.get("/partners", checkMaintence, (req, res) => {
        const Database = require("void.db");
        const db = new Database(path.join(__dirname, './database/json/partners.json'));
      renderTemplate(res, req, "partners.ejs", {roles, config, db});
    });
    app.get("/bot-rules", checkMaintence, (req, res) => {
      renderTemplate(res, req, "/botlist/bot-rules.ejs", {config,roles});
    });
    app.get("/robots.txt", function(req,res) {
      res.set('Content-Type', 'text/plain');
      res.send(`Sitemap: https://vcodes.xyz/sitemap.xml`);
    });

    app.get("/sitemap.xml", async function(req,res) {
        let link = "<url><loc>https://vcodes.xyz/</loc></url>";
        let botdataforxml = await botsdata.find()
        botdataforxml.forEach(bot => {
            link += "\n<url><loc>https://vcodes.xyz/bot/"+bot.botID+"</loc></url>";
        })
        res.set('Content-Type', 'text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="https://www.google.com/schemas/sitemap-image/1.1">${link}</urlset>`);
    });
    //------------------- CODE SHARE  -------------------//
    app.get("/code/:code", checkMaintence, checkAuth, async (req,res) => {
      let kod = req.params.code;
      let koddata = await codesSchema.findOne({ code: kod })
      if(!koddata) return res.redirect('/codes?error=true&message=You entered an invalid code.')
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id)) return res.redirect("/error?code=403&message=To do this, you have to join our discord server.");      
      if(koddata.codeCategory == "javascript") {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.javascript)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(koddata.codeCategory == "html") {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.html)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(koddata.codeCategory == "subs") {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.altyapilar)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(koddata.codeCategory == "5invites") {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.besdavet)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(koddata.codeCategory == "10invites") {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.ondavet)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(koddata.codeCategory == "15invites") {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.onbesdavet)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(koddata.codeCategory == "20invites") {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(config.server.roles.codeshare.yirmidavet)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(koddata.codeCategory == "bdfd") {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(rconfig.server.roles.codeshare.bdfd)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      renderTemplate(res, req, "codeshare/codeview.ejs", {req, roles, config, koddata});
    })
        app.get("/codes", checkMaintence, checkAuth, async(req,res) => {
        let data = await codesSchema.find()
        renderTemplate(res, req, "codeshare/codes/codes.ejs", {
            req,
            roles,
            config,
            data,
        });
        })
        app.get("/codes/:type", checkMaintence, checkAuth, async(req,res) => {
        let data = await codesSchema.find()
        renderTemplate(res, req, "codeshare/codes/codelist.ejs", {
            req,
            roles,
            config,
            data,
        });
        })
    //------------------- CODE SHARE  -------------------//
  
  
    
    //------------------- UPTİME -------------------//
    const uptimedata = require("./database/models/uptime.js");
    app.get("/uptime/add", checkMaintence, checkAuth, async (req,res) => {
      renderTemplate(res, req, "uptime/ekle.ejs", {req, roles, config});
    })
    app.post("/uptime/add", checkMaintence, checkAuth, async (req,res) => {
      const rBody = req.body;
      if(!rBody['link']) { 
          res.redirect('?error=true&message=Write a any link.')
      } else {
          if(!rBody['link'].match('https')) return res.redirect('?error=true&message=You must enter a valid link.')
          const updcode = makeidd(5);
          const dde = await uptimedata.findOne({link: rBody['link']});
          const dd = await uptimedata.find({userID: req.user.id});
          if(dd.length > 9) res.redirect('?error=true&message=Your uptime limit has reached.')
  
          if(dde) return res.redirect('?error=true&message=This link already exists in the system.')
          client.users.fetch(req.user.id).then(a => {
          client.channels.cache.get(channels.uptimelog).send(new Discord.MessageEmbed()
          .setAuthor(a.username, a.avatarURL({dynamic: true}))
          .setDescription("New link added uptime system.")
          .setThumbnail(client.user.avatarURL)
          .setColor("GREEN")
          .addField("User;", `${a.tag} \`(${a.id})\``, true)
          .addField("Uptime Code;", updcode, true)
          .addField("Uptime Limit;", `${dd.length+1}/10`, true)
          )
          new uptimedata({server: config.serverID, userName: a.username, userID: req.user.id, link: rBody['link'], code: updcode}).save();
        })
        res.redirect('?success=true&message=Your link has been successfully added to the uptime system.');
      }
    })
    app.get("/uptime/links", checkMaintence, checkAuth, async (req,res) => {
      let uptimes = await uptimedata.find({ userID: req.user.id })
      renderTemplate(res, req, "uptime/linklerim.ejs", {req, roles, config, uptimes});
     })
     app.get("/uptime/:code/delete", checkMaintence, checkAuth, async (req,res) => {
      const dde = await uptimedata.findOne({code: req.params.code});
      if(!dde) return res.redirect('/uptime/links?error=true&message=There is no such site in the system.')
      uptimedata.findOne({ 'code': req.params.code }, async function (err, docs) { 
              if(docs.userID != req.user.id) return res.redirect('/uptime/links?error=true&message=The link you tried to delete does not belong to you.');
              res.redirect('/uptime/links?success=true&message=The link has been successfully deleted from the system.');
              await uptimedata.deleteOne({ code: req.params.code });
       })
     })
    //------------------- UPTİME -------------------//
  
    //------------------- BOT LİST -------------------//
    
      app.get("/bots", checkMaintence, async (req,res) => {
            let page = req.query.page || 1;
            let data = await botsdata.find() || await botsdata.find().filter(b => b.status === "Approved")
            if(page < 1) return res.redirect(`/bots`);
            if(data.length <= 0) return res.redirect("/");
            if((page > Math.ceil(data.length / 6)))return res.redirect(`/bots`);
            if (Math.ceil(data.length / 6) < 1) {
            page = 1;
          };
          renderTemplate(res, req, "botlist/bots.ejs", {
              req,
              roles,
              config,
              data,
              page: page
          });
        })
         app.get("/bots/certified", checkMaintence, async (req,res) => {
          let page = req.query.page || 1;
          let x = await botsdata.find()
          let data = x.filter(b => b.certificate === "Certified")
          if(page < 1) return res.redirect(`/bots`);
          if(data.length <= 0) return res.redirect("/");
          if((page > Math.ceil(data.length / 6)))return res.redirect(`/bots`);
          if (Math.ceil(data.length / 6) < 1) {
              page = 1;
          };
          renderTemplate(res, req, "botlist/bots-certified.ejs", {
              req,
              roles,
              config,
              data,
              page: page
          });
        })
        app.get("/search", checkMaintence, async (req,res) => {
          let page = req.query.page || 1;
          let x = await botsdata.find()
          let data = x.filter(a => a.status == "Approved" && a.username.includes(req.query.q) || a.shortDesc.includes(req.query.q))
          if(page < 1) return res.redirect(`/bots`);
          if(data.length <= 0) return res.redirect("/");
          if((page > Math.ceil(data.length / 6)))return res.redirect(`/bots`);
          if (Math.ceil(data.length / 6) < 1) {
              page = 1;
          };
          renderTemplate(res, req, "botlist/search.ejs", {
              req,
              roles,
              config,
              data,
              page: page
          });
        })
        app.get("/tags", checkMaintence, async (req,res) => {
            renderTemplate(res, req, "botlist/tags.ejs", {
                req,
                roles,
                config
            });
          })
        app.get("/tag/:tag", checkMaintence, async (req,res) => {
            let page = req.query.page || 1;
            let x = await botsdata.find()
            let data = x.filter(a => a.status == "Approved" && a.tags.includes(req.params.tag))
            if(page < 1) return res.redirect(`/tag/`+req.params.tag);
            if(data.length <= 0) return res.redirect("/");
            if((page > Math.ceil(data.length / 6)))return res.redirect(`/tag/`+req.params.tag);
            if (Math.ceil(data.length / 6) < 1) {
              page = 1;
            };
            renderTemplate(res, req, "botlist/tag.ejs", {
                req,
                roles,
                config,
                data,
                page: page
            });
          })
    app.get("/addbot", checkMaintence, checkAuth, async (req,res) => {
      if(!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id)) return res.redirect("/error?code=403&message=To do this, you have to join our discord server.");
      renderTemplate(res, req, "botlist/addbot.ejs", {req, roles, config});
    })
    app.get("/bot/:botID/vote", checkMaintence, async (req,res) => {
      let botdata = await botsdata.findOne({ botID: req.params.botID });
      if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
      if(req.user) {
      if(!req.user.id === botdata.ownerID || req.user.id.includes(botdata.coowners)) {
        if(botdata.status != "Approved") return res.redirect("/error?code=404&message=You entered an invalid bot id.");
      }
      }
      renderTemplate(res, req, "botlist/vote.ejs", {req, roles, config, botdata});
    })
    app.post("/bot/:botID/vote", checkMaintence, checkAuth, async (req,res) => {
      const votes = require("./models/botlist/vote.js");
      let botdata = await botsdata.findOne({ botID: req.params.botID });
      let x = await votes.findOne({user: req.user.id,bot: req.params.botID})
      if(x) return res.redirect("/error?code=400&message=You can vote every 12 hours.");
      await votes.findOneAndUpdate({bot: req.params.botID, user: req.user.id }, {$set: {Date: Date.now(), ms: 43200000 }}, {upsert: true})
      await botsdata.findOneAndUpdate({botID: req.params.botID}, {$inc: {votes: 1}})
      client.channels.cache.get(channels.votes).send(`**${req.user.username}** voted **${botdata.username}** **\`(${botdata.votes + 1} votes)\`**`)
      return res.redirect(`/bot/${req.params.botID}/vote?success=true&message=You voted successfully. You can vote again after 12 hours.`);
      renderTemplate(res, req, "botlist/vote.ejs", {req, roles, config, botdata});
    })
  
    app.post("/addbot", checkMaintence, checkAuth, async (req,res) => {
      let rBody = req.body;
      let botvarmi = await botsdata.findOne({botID: rBody['botID']});
      if(botvarmi) return res.redirect('/error?code=404&message=The bot you are trying to add exists in the system.');

      client.users.fetch(req.body.botID).then(async a => {
      if(!a.bot) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
      if(!a) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
      if(rBody['coowners']) {
          if(String(rBody['coowners']).split(',').length > 3) return res.redirect("?error=true&message=You can add up to 3 CO-Owners..")
          if(String(rBody['coowners']).split(',').includes(req.user.id)) return res.redirect("?error=true&message=You cannot add yourself to other CO-Owners.");
      }
      await new botsdata({
           botID: rBody['botID'], 
           ownerID: req.user.id,
           ownerName: req.user.usename,
           username: a.username,
           discrim: a.discriminator,
           avatar: a.avatarURL(),
           prefix: rBody['prefix'],
           longDesc: rBody['longDesc'],
           shortDesc: rBody['shortDesc'],
           status: "UnApproved",
           tags: rBody['tags'],
           certificate: "None",
           token: makeToken(24),
      }).save()
      if(rBody['background']) {
          await botsdata.findOneAndUpdate({botID: rBody['botID']},{$set: {backURL: rBody['background']}}, function (err,docs) {})
      }
      if(rBody['github']) {
          await botsdata.findOneAndUpdate({botID: rBody['botID']},{$set: {github: rBody['github']}}, function (err,docs) {})
      }
      if(rBody['website']) {
          await botsdata.findOneAndUpdate({botID: rBody['botID']},{$set: {website: rBody['website']}}, function (err,docs) {})
      }
      if(rBody['support']) {
          await botsdata.findOneAndUpdate({botID: rBody['botID']},{$set: {support: rBody['support']}}, function (err,docs) {})
      }
      if(rBody['coowners']) {
          if(String(rBody['coowners']).split(',').length > 3) return res.redirect("?error=true&message=You can add up to 3 CO-Owners..")
          if(String(rBody['coowners']).split(',').includes(req.user.id)) return res.redirect("?error=true&message=You cannot add yourself to other CO-Owners.");
          await botsdata.findOneAndUpdate({botID: rBody['botID']},{$set: { coowners: String(rBody['coowners']).split(',') }}, function (err,docs) {})
      }
      })
      client.users.fetch(rBody['botID']).then(a => {
      client.channels.cache.get(channels.botlog).send(`<@${req.user.id}> added **${a.tag}**`)
      res.redirect(`?success=true&message=Your bot has been successfully added to the system.&botID=${rBody['botID']}`)
      })
    })

    app.get("/bot/:botID", checkMaintence, async (req,res,next) => {
      let botdata = await botsdata.findOne({botID: req.params.botID});
      if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
      if(botdata.status != "Approved") {
        if(req.user.id == botdata.ownerID || botdata.coowners.includes(req.user.id)) {
          let coowner = new Array()
          botdata.coowners.map(a => {
              client.users.fetch(a).then(b => coowner.push(b))
          })
          client.users.fetch(botdata.ownerID).then(aowner => {
          client.users.fetch(req.params.botID).then(abot => {
              renderTemplate(res, req, "botlist/bot.ejs", { req, abot, config, botdata, coowner, aowner, roles});
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
        client.users.fetch(botdata.ownerID).then(aowner => {
        client.users.fetch(req.params.botID).then(abot => {
            renderTemplate(res, req, "botlist/bot.ejs", { req, abot, config, botdata, coowner, aowner, roles});
        });
        });
      }
    });
    app.post("/bot/:botID", async (req,res) => {
      let botdata = await botsdata.findOne({botID: req.params.botID});
        client.users.fetch(botdata.botID).then(async bot => {
          client.users.fetch(botdata.ownerID).then(async owner => {
          if(bot) {
          await botsdata.findOneAndUpdate({ botID: botdata.botID },{$set: { ownerName: owner.username, username: bot.username, discrim: bot.discriminator, avatar: bot.avatarURL() }})
          } else {
          await botsdata.findOneAndDelete({ botID: botdata.botID })
          }
          })
        })
        return res.redirect('/bot/'+req.params.botID);
    })

    app.get("/bot/:botID/edit", checkMaintence, checkAuth, async (req,res) => {
      let botdata = await botsdata.findOne({botID: req.params.botID});
      if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.")
      if(req.user.id == botdata.ownerID || botdata.coowners.includes(req.user.id)) {
        renderTemplate(res, req, "botlist/bot-edit.ejs", { req, config, botdata, roles});
      } else {
        res.redirect("/error?code=404&message=To edit this bot, you must be one of its owners.");
      }
    });
  
  
    app.post("/bot/:botID/edit", checkMaintence, checkAuth, async (req,res) => {
      let rBody = req.body;
      let botdata = await botsdata.findOne({ botID: req.params.botID })
      if(String(rBody['coowners']).split(',').length > 3) return res.redirect("?error=true&message=You can add up to 3 CO-Owners..")
      if(String(rBody['coowners']).split(',').includes(req.user.id)) return res.redirect("?error=true&message=You cannot add yourself to other CO-Owners.");
      await botsdata.findOneAndUpdate({botID: req.params.botID},{$set: {
          botID: req.params.botID,
          ownerID: botdata.ownerID,
          prefix: rBody['prefix'],
          longDesc: rBody['longDesc'],
          shortDesc: rBody['shortDesc'],
          tags: rBody['tags'],
          github: rBody['github'],
          website: rBody['website'],
          support: rBody['support'],
          coowners: String(rBody['coowners']).split(','),
          backURL: rBody['background'],
      }
     }, function (err,docs) {})
      client.users.fetch(req.params.botID).then(a => {
      client.channels.cache.get(channels.botlog).send(`<@${req.user.id}> edited **${a.tag}**`)
      res.redirect(`?success=true&message=Your bot has been successfully edited.&botID=${req.params.botID}`)
      })
    })
  
    app.get("/bot/:botID/delete", async (req, res) => {
        let botdata = await botsdata.findOne({ botID: req.params.botID })
        if(req.user.id === botdata.ownerID || botdata.coowners.includes(req.user.id)) {
          let guild = client.guilds.cache.get(config.server.id).members.cache.get(botdata.botID);
          await botsdata.deleteOne({ botID: req.params.botID, ownerID: botdata.ownerID })
          return res.redirect(`/user/${req.user.id}?success=true&message=Bot succesfully deleted.`)

        } else {
            return res.redirect("/error?code=404&message=You entered an invalid bot id.");
        }
    })
  
      //------------------- BOT LİST -------------------//
  
      //---------------- ADMIN ---------------\\
      const appsdata = require("./database/models/botlist/certificate-apps.js");
      // CERTIFICATE APP
      app.get("/certification", checkMaintence, checkAuth, async (req, res) => {
          renderTemplate(res, req, "/botlist/apps/certification.ejs", {req, roles, config})
      });
      app.get("/certification/apply", checkMaintence, checkAuth, async (req, res) => {
          const userbots = await botsdata.find({ ownerID: req.user.id })
          renderTemplate(res, req, "/botlist/apps/certificate-app.ejs", {req, roles, config, userbots})
      });
      app.post("/certification/apply", checkMaintence, checkAuth, async (req, res) => {
          const rBody = req.body;
          new appsdata({botID: rBody['bot'], future: rBody['future']}).save();
          res.redirect("/bots?success=true&message=Certificate application applied.&botID="+rBody['bot'])
          let botdata = await botsdata.findOne({ botID: rBody['bot'] })
          client.channels.cache.get(channels.botlog).send(`User **${req.user.username}** requested a certificate for her bot named **${botdata.username}**.`)
      });
      //
      const checkAdmin = async (req, res, next) => {
      if (req.isAuthenticated()) {
          if(client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(roles.yonetici) || client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.get(roles.moderator)) {
              next();
              } else {
              res.redirect("/error?code=403&message=You is not competent to do this.")
          }
        } else {
      req.session.backURL = req.url;
      res.redirect("/login");
      }
      }
      app.get("/admin", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
      const botdata = await botsdata.find()
      const codedata = await codesSchema.find()
      const udata = await uptimedata.find()
      renderTemplate(res, req, "admin/index.ejs", {req, roles, config, codedata, botdata, udata})
      });
      // MINI PAGES
      app.get("/admin/unapproved", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
      const botdata = await botsdata.find()
      renderTemplate(res, req, "admin/unapproved.ejs", {req, roles, config, botdata})
      });
      app.get("/admin/approved", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const botdata = await botsdata.find()
          renderTemplate(res, req, "admin/approved.ejs", {req, roles, config, botdata})
      });
      app.get("/admin/certificate-apps", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const botdata = await botsdata.find()
          const apps = await appsdata.find()
          renderTemplate(res, req, "admin/certificate-apps.ejs", {req, roles, config, apps,botdata})
      });
      // SYSTEMS PAGES
  
      // CONFIRM BOT
      app.get("/admin/confirm/:botID", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const botdata = await botsdata.findOne({ botID: req.params.botID })
          if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
          await botsdata.findOneAndUpdate({botID: req.params.botID},{$set: {
              status: "Approved",
              Date: Date.now(),
          }
         }, function (err,docs) {})
         client.users.fetch(req.params.botID).then(bota => {
              client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named **${bota.tag}** has been approved. `)
              client.users.cache.get(botdata.ownerID).send(`Your bot named **${bota.tag}** has been approved.`)
         });
         let guild = client.guilds.cache.get(config.server.id)
         guild.members.cache.get(botdata.botID).roles.add(roles.botlist.bot);
         guild.members.cache.get(botdata.ownerID).roles.add(roles.botlist.developer);
         if(botdata.coowners) {
             botdata.coowners.map(a => {
               guild.members.cache.get(a).roles.add(roles.botlist.developer);
             })
         }
         return res.redirect(`/admin/unapproved?success=true&message=Bot approved.`)
      });
      // DELETE BOT
      app.get("/admin/delete/:botID", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const botdata = await botsdata.findOne({ botID: req.params.botID })
          if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
          let guild = client.guilds.cache.get(config.server.id)
          guild.members.cache.get(botdata.botID).roles.remove(roles.bot);
          await guild.members.cache.get(botdata.botID).kick();
          await botsdata.deleteOne({ botID: req.params.botID, ownerID: botdata.ownerID })
          return res.redirect(`/admin/approved?success=true&message=Bot deleted.`)
       });
      // DECLINE BOT
      app.get("/admin/decline/:botID", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
         const botdata = await botsdata.findOne({ botID: req.params.botID })
         if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
         renderTemplate(res, req, "admin/decline.ejs", {req, roles, config, botdata})
      });
      app.post("/admin/decline/:botID", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          let rBody = req.body;
     	  let botdata = await botsdata.findOne({ botID: req.params.botID });
           client.users.fetch(botdata.ownerID).then(sahip => {
               client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named **${botdata.username}** has been declined. `)
               client.users.cache.get(botdata.ownerID).send(`Your bot named **${botdata.username}** has been declined.\nReason: **${rBody['reason']}**\nAuthorized: **${req.user.username}**`)
          })
          await botsdata.deleteOne({ botID: req.params.botID, ownerID: botdata.ownerID })
          return res.redirect(`/admin/unapproved?success=true&message=Bot declined.`)
       });

       // CERTIFICATE
       app.get("/admin/certified-bots", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const botdata = await botsdata.find();
          renderTemplate(res, req, "admin/certified-bots.ejs", {req, roles, config, botdata})
       });
       app.get("/admin/certificate/give/:botID", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          await botsdata.findOneAndUpdate({botID: req.params.botID},{$set: {
              certificate: "Certified",
          }
         }, function (err,docs) {})
         let botdata = await botsdata.findOne({ botID: req.params.botID });
  
          client.users.fetch(botdata.botID).then(bota => {
              client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named **${bota.tag}** has been granted a certificate.`)
              client.users.cache.get(botdata.ownerID).send(`Your bot named **${bota.tag}** has been certified.`)
          });
          await appsdata.deleteOne({ botID: req.params.botID })
          let guild = client.guilds.cache.get(config.server.id)
          guild.members.cache.get(botdata.botID).roles.add(roles.botlist.certified_bot);
          guild.members.cache.get(botdata.ownerID).roles.add(roles.botlist.certified_developer);
          if(botdata.coowners) {
              botdata.coowners.map(a => {
                if(guild.members.cache.get(a)) {
                guild.members.cache.get(a).roles.add(roles.botlist.certified_developer);
                }
              })
          }
          return res.redirect(`/admin/certificate-apps?success=true&message=Certificate gived.&botID=${req.params.botID}`)
       });
       app.get("/admin/certificate/delete/:botID", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const botdata = await botsdata.findOne({ botID: req.params.botID })
          if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
          renderTemplate(res, req, "admin/certificate-delete.ejs", {req, roles, config, botdata})
       });
       app.post("/admin/certificate/delete/:botID", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          let rBody = req.body;
          await botsdata.findOneAndUpdate({botID: req.params.botID},{$set: {
              certificate: "None",
          }
         }, function (err,docs) {})
         let botdata = await botsdata.findOne({ botID: req.params.botID });
          client.users.fetch(botdata.botID).then(bota => {
              client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named **${bota.tag}** has not been granted a certificate.`)
              client.users.cache.get(botdata.ownerID).send(`Your bot named **${bota.tag}** certificate application has been declined.\nReason: **${rBody['reason']}**`)
          });
          await appsdata.deleteOne({ botID: req.params.botID })
          let guild = client.guilds.cache.get(config.server.id)
          guild.members.cache.get(botdata.botID).roles.remove(roles.botlist.certified_bot);
          guild.members.cache.get(botdata.ownerID).roles.remove(roles.botlist.certified_developer);
          return res.redirect(`/admin/certificate-apps?success=true&message=Certificate deleted.`)
       });
  
       // CODE SHARE
       app.get("/admin/codes", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
         let koddata = await codesSchema.find();
        renderTemplate(res, req, "admin/codes.ejs", {req, roles, config, koddata})
     });
       // ADDCODE
       app.get("/admin/addcode", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          renderTemplate(res, req, "admin/addcode.ejs", {req, roles, config})
       });
       app.post("/admin/addcode", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const rBody = req.body;
          let kod = makeid(5);
          await new codesSchema({
              code: kod,
              codeName: rBody['codename'],
              codeCategory: rBody['category'],
              codeDesc: rBody['codedesc'],
           }).save()
          if(rBody['main']) { 
            await codesSchema.updateOne({code: kod},{$set:{ main: req.body.main }}); 
          }
          if(rBody['commands']) { 
            await codesSchema.updateOne({code: kod},{$set:{ commands: req.body.commands }}); 
          }
          client.channels.cache.get(channels.codelog).send(new Discord.MessageEmbed()
          .setTitle("New code added!").setColor("GREEN").setFooter(config.footer)
          .setDescription(`The user named **[${req.user.username}](https://vcodes.xyz/user/${req.user.id})** added the code named **${rBody['codename']}** to the system.`)
          .addField("Code Link", `https://vcodes.xyz/code/${kod}`, true)
          .addField("Code Description", rBody['codedesc'], true)
          .addField("Code Category", rBody['category'], true)
          )
          res.redirect('/code/'+kod)
       }); 
  
       // EDITCODE
       app.get("/admin/editcode/:code", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          let kod = req.params.code;
          let koddata = await codesSchema.findOne({ code: kod })
          if(!koddata) return res.redirect('/codes?error=true&message=You entered an invalid code.')
          renderTemplate(res, req, "admin/editcode.ejs", {req, roles, config, koddata})
       });
       app.post("/admin/editcode/:code", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const rBody = req.body;
          let kod = req.params.code;
          await codesSchema.findOneAndUpdate({code: kod},{$set: { 
              codeName: rBody['codename'],
              codeCategory: rBody['category'],
              codeDesc: rBody['codedesc'],
              main: rBody['main'],
              commands: rBody['commands'],
           }}, function (err,docs) {})
          client.channels.cache.get(channels.codelog).send(new Discord.MessageEmbed()
          .setTitle("Code edited!").setColor("GREEN").setFooter(config.footer)
          .setDescription(`The user named **[${req.user.username}](https://vcodes.xyz/user/${req.user.id})** edited the code named **${rBody['codename']}**.`)
          .addField("Code Link", `https://vcodes.xyz/code/${kod}`, true)
          .addField("Code Description", rBody['codedesc'], true)
          .addField("Code Category", rBody['category'], true)
          )
          res.redirect('/code/'+kod)
       }); 
       // DELETECODE
       app.get("/admin/deletecode/:code", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          await codesSchema.deleteOne({ code: req.params.code })
          return res.redirect('/admin/codes?error=true&message=Code deleted.');
       });
  
       // UPTIME
       // UPTIMES
       app.get("/admin/uptimes", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        let updata = await uptimeSchema.find();
        renderTemplate(res, req, "admin/uptimes.ejs", {req, roles, config, updata})
      });
      app.get("/admin/deleteuptime/:code", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        await uptimeSchema.deleteOne({ code: req.params.code })
        return res.redirect('../admin/uptimes?error=true&message=Link deleted.');
      });

      app.get("/admin/maintence", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!config.bot.owners.includes(req.user.id)) return res.redirect('../admin');
        let bandata = await banSchema.find();
        renderTemplate(res, req, "/admin/administrator/maintence.ejs", { req, roles, config, bandata })
      });
      app.post("/admin/maintence", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!config.bot.owners.includes(req.user.id)) return res.redirect('../admin');
        let bakimdata = await maintenceSchema.findOne({ server: config.server.id });
        if(bakimdata) return res.redirect('../admin/maintence?error=true&message=Maintenance mode has already been activated for this site.');
        client.channels.cache.get(channels.webstatus).send(`<a:maintence:833375738547535913> vCodes has been switched to __maintance__ due to **${req.body.reason}**`).then(a => { 
            new maintenceSchema({server: config.server.id, reason: req.body.reason, bakimmsg: a.id}).save();
        })
        return res.redirect('../admin/maintence?success=true&message=Maintence opened.');
      });
      app.post("/admin/unmaintence", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        const dc = require("discord.js");
        if(!config.bot.owners.includes(req.user.id)) return res.redirect('../admin');
        let bakimdata = await maintenceSchema.findOne({ server: config.server.id });
        if(!bakimdata) return res.redirect('../admin/maintence?error=true&message=The website is not in maintenance mode anyway.');
        const bakimsonaerdikardesvcodes = new dc.MessageEmbed()
        .setAuthor("vcodes.xyz", client.user.avatarURL())
        .setThumbnail(client.user.avatarURL())
        .setColor("GREEN")
        .setDescription(`<a:online:833375738785824788> vCodes are **active** again!\n[Click to redirect website](https://vcodes.xyz)`)
        .setFooter("vCodes © All rights reserved.");
        await client.channels.cache.get(channels.webstatus).messages.fetch(bakimdata.bakimmsg).then(a => { a.edit(`~~ <a:maintence:833375738547535913> vCodes has been switched to __maintance__ due to **${bakimdata.reason}** ~~`, bakimsonaerdikardesvcodes) } )
        client.channels.cache.get(channels.webstatus).send(".").then(b => { b.delete({ timeout: 500 })})
        await maintenceSchema.deleteOne({server: config.server.id}, function (error, server) { 
        if(error) console.log(error)
        });
        return res.redirect('../admin/maintence?success=true&message=Maintenance mode has been shut down successfully.');
      });
      app.get("/admin/userban", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!config.bot.owners.includes(req.user.id)) return res.redirect('../admin');
        let bandata = await banSchema.find();
        renderTemplate(res, req, "/admin/administrator/user-ban.ejs", { req, roles, config, bandata })
      });
      app.post("/admin/userban", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!config.bot.owners.includes(req.user.id)) return res.redirect('../admin');
        new banSchema({ user: req.body.userID, sebep: req.body.reason, yetkili: req.user.id }).save()
        return res.redirect('../admin/userban?success=true&message=User banned.');
      });
      app.post("/admin/userunban", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!config.bot.owners.includes(req.user.id)) return res.redirect('../admin');
        banSchema.deleteOne({ user: req.body.userID }, function (error, user) { 
        if(error) console.log(error)
        })
        return res.redirect('../admin/userban?success=true&message=User ban removed.');
      });
    
      app.get("/admin/partners", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!config.bot.owners.includes(req.user.id)) return res.redirect('../admin');
        const Database = require("void.db");
        const db = new Database(path.join(__dirname, './database/json/partners.json'));
        renderTemplate(res, req, "/admin/administrator/partners.ejs", { req, roles, config, db })
      });
       app.post("/admin/partners", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!config.bot.owners.includes(req.user.id)) return res.redirect('../admin');
        const Database = require("void.db");
        const db = new Database(path.join(__dirname, './database/json/partners.json'));
         db.push(`partners`, { 
           code: createID(12), 
           icon: req.body.icon,
           ownerID: req.body.ownerID,
           serverName: req.body.serverName,
           website: req.body.Website,
           description: req.body.partnerDesc
         })
         let x = client.guilds.cache.get(config.server.id).members.cache.get(req.body.ownerID)
         if(x) {
           x.roles.add(roles.profile.partnerRole)
         }
         return res.redirect('/admin/partners?success=true&message=Partner added.')
      });
      //---------------- ADMIN ---------------\\
  
    //------------------- PROFILE -------------------//
    
    const profiledata = require("./database/models/profile.js");
    app.get("/user/:userID", checkMaintence, async (req, res) => {
      client.users.fetch(req.params.userID).then(async a => {
      let codecount = await codesSchema.find({ sharer: a.id })
      const pdata = await profiledata.findOne({userID: a.id});
      const botdata = await botsdata.find()
      const member = a;
      const uptimecount = await uptimedata.find({userID: a.id});
      renderTemplate(res, req, "profile/profile.ejs", {member, req, roles, config, codecount, uptimecount, pdata, botdata});
      });
    });
    app.get("/user/:userID/edit", checkMaintence, checkAuth, async (req, res) => {
      client.users.fetch(req.user.id).then(async member => {
      const pdata = await profiledata.findOne({userID: member.id});
      renderTemplate(res, req, "profile/profile-edit.ejs", {member, req, roles, config, pdata, member});
      });
    });
    app.post("/user/:userID/edit", checkMaintence, checkAuth, async (req, res) => {
      let rBody = req.body;
        await profiledata.findOneAndUpdate({userID: req.user.id}, {$set: {
            biography: rBody['biography'],
            website: rBody['website'],
            github: rBody['github'],
            twitter: rBody['twitter'],
            instagram: rBody['instagram']
            }}, 
            {
                upsert:true
            }
            )
      return res.redirect('?success=true&message=Your profile has been successfully edited.');
    });
    //------------------- PROFILE -------------------//
    app.set('json spaces', 1)
   //------------------- API  -------------------//
    app.get("/api", async (req, res) => {
      res.json({ "Hello": "World", "Template by": "v c o d e s . x y z"});
    });
    app.get("/api/bots/:botID", async (req, res) => {
      const botinfo = await botsdata.findOne({ botID: req.params.botID })
      if(!botinfo) return res.json({ "error": "You entered invalid bot id."})
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
        if(!token) return res.json({"error": "You must enter a bot token."})
        if(!req.params.userID) return res.json({"error": "You must enter a user id."})
        const botdata = await botsdata.findOne({ token: token })
        if(!botdata) return res.json({"error": "You entered an invalid bot token."})
        const vote = await voteSchema.findOne({ bot: botdata.botID, user: req.params.userID })
        if(vote) {
            res.json({ voted: true });
        } else {
            res.json({ voted: false });
        }
    });
    app.post("/api/bots/stats", async (req, res) => {
        let token = req.header('Authorization');
        if(!token) return res.json({"error": "You must enter a bot token."})
        const botdata = await botsdata.findOne({ token: token })
        if(!botdata) return res.json({"error": "You entered an invalid bot token."})
        if(botdata) {
            return await botsdata.update({botID: botdata.botID},{$set:{ serverCount: req.header('serverCount') }})
        }
    });
    //------------------- API -------------------//    //------------------- API -------------------//
    app.use((req, res) => {
        res.status(404).redirect("/")
    });
  };
  
  function makeid(length) {
     var result           = '';
     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  }
      function createID(length) {
      var result           = '';
      var characters       = '123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
   }
  function makeidd(length) {
      var result           = '';
      var characters       = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
   }
   function makeToken(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
  function getuser(id) {
  try {
  return client.users.fetch(id)
  } catch (error) {
  return undefined
  }
  } 
  