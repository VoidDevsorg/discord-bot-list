
  const url = require("url");
  const path = require("path");
  const express = require("express");
  const passport = require("passport");
  const session = require("express-session");
  const Strategy = require("passport-discord").Strategy;
  const config = require("./settings.json");
  const ejs = require("ejs");
  const bodyParser = require("body-parser");
  const Discord = require("discord.js");
  const settingsc = require("./settings.json");
  const roles = require("./roles.json");
  const channels = require("./channels.json");
  const codesSchema = require("./models/codes.js");
  const uptimeSchema = require("./models/uptime.js");
  const banSchema = require("./models/site-ban.js");
  const maintenceSchema = require('./models/bakim.js');
  const app = express();
  const MemoryStore = require("memorystore")(session);
  const botsdata = require("./models/botlist/bots.js");
  const fetch = require("node-fetch");
  const cookieParser = require('cookie-parser');
  const referrerPolicy = require('referrer-policy')
  app.use(referrerPolicy({ policy: "strict-origin" }))
  module.exports = async (client) => {

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
    const templateDir = path.resolve(`${process.cwd()}${path.sep}www`);
    app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}assets/css`)));
    app.use("/js", express.static(path.resolve(`${templateDir}${path.sep}assets/js`)));
    app.use("/img", express.static(path.resolve(`${templateDir}${path.sep}assets/img`)));
  
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
  
    passport.use(new Strategy({
      clientID: config.clientid,
      clientSecret: config.clientsecret,
      callbackURL: config.clientcallback,
      scope: ["identify", "guilds"]
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
      const d = await maintenceSchema.findOne({server: settingsc.serverID });
      if(d) {
          if(req.isAuthenticated()) {
              let uyevarmikiaq = client.guilds.cache.get(settingsc.serverID).members.cache.get(req.user.id);
              if(uyevarmikiaq) {
                  if(uyevarmikiaq.roles.cache.get(roles.yonetici)) {
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
    passport.authenticate("discord"));
    app.get("/callback", passport.authenticate("discord", { failureRedirect: "/error?code=999&message=We encountered an error while connecting." }), async (req, res) => {
        let banned = await banSchema.findOne({user: req.user.id})
        if(banned) {
        client.users.fetch(req.user.id).then(async a => {
        client.channels.cache.get(channels.login).send(new Discord.MessageEmbed().setAuthor(a.username, a.avatarURL({dynamic: true})).setThumbnail(a.avatarURL({dynamic: true})).setColor("RED").setDescription(`[**${a.username}**#${a.discriminator}](https://vcodes.xyz/user/${a.id}) isimli kullanıcı **siteye** giriş yapmaya çalıştı fakat siteden engellendiği için giriş yapamadı.`).addField("Username", a.username).addField("User ID", a.id).addField("User Discriminator", a.discriminator))
        })
        req.session.destroy(() => {
        res.json({ login: false, message: "You have been blocked from vCodes.", reason: `${banned.sebep}` })
        req.logout();
        });
        } else {
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
    http.listen(80);
    //------------------- EXTRA -------------------//
    app.get("/", checkMaintence, async (req, res) => {
      const botdata = await botsdata.find();
      renderTemplate(res, req, "index.ejs", {config, roles, botdata, getuser});
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
      renderTemplate(res, req, "partners.ejs", {roles, config});
    });
    app.get("/bot-rules", checkMaintence, (req, res) => {
      renderTemplate(res, req, "/botlist/bot-rules.ejs", {config,roles});
    });
  
    //------------------- CODE SHARE  -------------------//
    app.get("/code/:code", checkMaintence, checkAuth, async (req,res) => {
      let kod = req.params.code;
      if(!client.guilds.cache.get(settingsc.serverID).members.cache.get(req.user.id)) return res.redirect("/error?code=403&message=To do this, you have to join our discord server.");
      codesSchema.findOne({code:kod}, function (err,docs) {
      if(!docs) {
        res.redirect("/error?code=403&message=You is not competent to do this.");
      } else {
  
      if(docs.codeCategory == "javascript") {
      if(!client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.javascript)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(docs.codeCategory == "html") {
      if(!client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.html)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(docs.codeCategory == "subs") {
      if(!client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.altyapilar)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(docs.codeCategory == "5invites") {
      if(!client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.besdavet)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(docs.codeCategory == "10invites") {
      if(!client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.ondavet)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(docs.codeCategory == "15invites") {
      if(!client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.onbesdavet)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(docs.codeCategory == "20invites") {
      if(!client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.yirmidavet)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      if(docs.codeCategory == "bdfd") {
      if(!client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.bdfd)) return res.redirect("/error?code=403&message=You is not competent to do this.");
      }
      renderTemplate(res, req, "codeshare/codeview.ejs", {req, roles, config, docs});
      }
      })
    })
    /* app.get("/code-request", checkMaintence, checkAuth, async (req,res) => {
     renderTemplate(res, req, "codeshare/code-request.ejs", {req, roles, config});
    })
    app.post("/code-request", checkMaintence, checkAuth, async (req,res) => {
       client.users.fetch(req.user.id).then(a => {
         let rBody = req.body;
         client.channels.cache.get(channels.request).send(new Discord.MessageEmbed()
                              .setTitle("Code Request").setColor("GREEN").setAuthor(a.username, a.avatarURL({dynamic: true}))
                              .setThumbnail(client.user.avatarURL({dynamic: true}))
                              .setDescription(`User **[${a.username}#${a.discriminator}](https://vcodes.xyz/user/${a.id})** requested the code named **${rBody['kodadi']}**.`)
                              .addField("Code Description", rBody['aciklama'], true)
                              .addField("Code Category", rBody['kategori'], true)
                              .setFooter(config.footer))
      })
      return res.redirect("/user/"+req.user.id)
    }) */
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
    const uptimedata = require("./models/uptime.js");
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
    if((page > Math.ceil(data.length / 8)))return res.redirect(`/bots`);
    if (Math.ceil(data.length / 8) < 1) {
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
        app.get("/search", checkMaintence, async (req,res) => {
          let page = req.query.page || 1;
          let x = await botsdata.find()
          let data = x.filter(a => a.status == "Approved" && a.username.includes(req.query.q) || a.shortDesc.includes(req.query.q))
         if(page < 1) return res.redirect(`/bots`);
         if(data.length <= 0) return res.redirect("/");
         if((page > Math.ceil(data.length / 8)))return res.redirect(`/bots`);
          if (Math.ceil(data.length / 8) < 1) {
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
      if((page > Math.ceil(data.length / 8)))return res.redirect(`/tag/`+req.params.tag);
      if (Math.ceil(data.length / 8) < 1) {
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
      if(!client.guilds.cache.get(settingsc.serverID).members.cache.get(req.user.id)) return res.redirect("/error?code=403&message=To do this, you have to join our discord server.");
      renderTemplate(res, req, "botlist/addbot.ejs", {req, roles, config});
    })
    app.get("/bot/@:privateURL/vote", checkMaintence, async (req,res) => {
      let botdata = await botsdata.findOne({ privateURL: req.params.privateURL });
      if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
      if(req.user) {
      if(!req.user.id === botdata.ownerID || req.user.id.includes(botdata.coowners)) {
        if(botdata.status != "Approved") return res.redirect("/error?code=404&message=You entered an invalid bot id.");
      }
      }
      renderTemplate(res, req, "botlist/vote.ejs", {req, roles, config, botdata});
    })
    app.post("/bot/@:privateURL/vote", checkMaintence, checkAuth, async (req,res) => {
      const votes = require("./models/botlist/vote.js");
      let botdata = await botsdata.findOne({ privateURL: req.params.privateURL });
      let x = await votes.findOne({user: req.user.id,bot: botdata.botID })
      if(x) return res.redirect("/error?code=400&message=You can vote every 12 hours.");
      await votes.findOneAndUpdate({bot: botdata.botID, user: req.user.id }, {$set: {Date: Date.now(), ms: 43200000 }}, {upsert: true})
      await botsdata.findOneAndUpdate({botID: botdata.botID}, {$inc: {votes: 1}})
      client.channels.cache.get(channels.votes).send(`**${req.user.username}** voted **${botdata.username}** **\`(${botdata.votes + 1} votes)\`**`)
      return res.redirect(`/bot/@${req.params.privateURL}/vote?success=true&message=You voted successfully. You can vote again after 12 hours.`);
      renderTemplate(res, req, "botlist/vote.ejs", {req, roles, config, botdata});
    })
    app.get("/bot/:botID/vote", checkMaintence, async (req,res) => {
      let botdata = await botsdata.findOne({ botID: req.params.botID });
      if(botdata.privateURL) return res.redirect('/bot/@'+botdata.privateURL+'/vote');
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
      rBody = req.body;
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
           certificate: "None"
      }).save()
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
    app.get("/bot/@:privateURL", checkMaintence, async (req,res,next) => {
      let botdata = await botsdata.findOne({ privateURL: req.params.privateURL });
      if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
        let coowner = new Array()
        botdata.coowners.map(a => {
            client.users.fetch(a).then(b => coowner.push(b))
        })
        client.users.fetch(botdata.ownerID).then(aowner => {
        client.users.fetch(botdata.botID).then(abot => {
            renderTemplate(res, req, "botlist/bot.ejs", { req, abot, config, botdata, coowner, aowner, roles});
        });
        });
    });
    app.get("/bot/:botID", checkMaintence, async (req,res,next) => {
      let botdata = await botsdata.findOne({botID: req.params.botID});
      if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
      if(botdata.privateURL) return res.redirect('/bot/@'+botdata.privateURL)
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
    app.post("/bot/@:privateURL", checkMaintence, async (req,res,next) => {
      let botdata = await botsdata.findOne({ privateURL: req.params.privateURL});
        client.users.fetch(botdata.botID).then(async bot => {
          client.users.fetch(botdata.ownerID).then(async owner => {
          if(bot) {
          await botsdata.findOneAndUpdate({ botID: botdata.botID },{$set: { ownerName: owner.username, username: bot.username, discrim: bot.discriminator, avatar: bot.avatarURL() }})
          } else {
          await botsdata.findOneAndDelete({ botID: botdata.botID })
          }
          })
        })
        return res.redirect('/bot/@'+req.params.privateURL);
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
      let database = botsdata.find();
      if(database.filter(a => a.botID != req.body.botID && a.privateURL == req.body.privateURL)) return res.redirect('?error=true&message=This private url belongs to another bot.');
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
          privateURL: rBody['privateURL'],
          coowners: String(rBody['coowners']).split(','),
      }
     }, function (err,docs) {})
      client.users.fetch(req.params.botID).then(a => {
      client.channels.cache.get(channels.botlog).send(`<@${req.user.id}> edited **${a.tag}**`)
      res.redirect(`?success=true&message=Your bot has been successfully edited.&botID=${req.params.botID}`)
      })
    })
  
  
  
      //------------------- BOT LİST -------------------//
  
      //---------------- ADMIN ---------------\\
      const appsdata = require("./models/botlist/certificate-apps.js");
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
          client.channels.cache.get(channels.botlog).send(`User **${botdata.ownerName}** requested a certificate for her bot named **${botdata.username}**.`)
      });
      //
      const checkAdmin = async (req, res, next) => {
      if (req.isAuthenticated()) {
          if(client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.yonetici) || client.guilds.cache.get(config.serverID).members.cache.get(req.user.id).roles.cache.get(roles.moderator)) {
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
      const alexarank = require("alexa-rank-nodejs");
      renderTemplate(res, req, "admin/index.ejs", {req, roles, config, codedata, botdata, udata, alexarank})
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
         let guild = client.guilds.cache.get(settingsc.serverID)
         guild.members.cache.get(botdata.botID).roles.add(roles.bot);
         guild.members.cache.get(botdata.ownerID).roles.add(roles.developer);
         if(botdata.coowners) {
             botdata.coowners.map(a => {
               guild.members.cache.get(a).roles.add(roles.developer);
             })
         }
         return res.redirect(`/admin/unapproved?success=true&message=Bot approved.`)
      });
      // DELETE BOT
      app.get("/admin/delete/:botID", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
          const botdata = await botsdata.findOne({ botID: req.params.botID })
          if(!botdata) return res.redirect("/error?code=404&message=You entered an invalid bot id.");
          let guild = client.guilds.cache.get(settingsc.serverID)
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
     let botadata = await botsdata.findOne({ botID: req.params.botID });
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
          let guild = client.guilds.cache.get(settingsc.serverID)
          guild.members.cache.get(botdata.botID).roles.add(roles.certified_bot);
          guild.members.cache.get(botdata.ownerID).roles.add(roles.certified_developer);
          if(botdata.coowners) {
              botdata.coowners.map(a => {
                if(guild.members.cache.get(a)) {
                guild.members.cache.get(a).roles.add(roles.certified_developer);
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
          let guild = client.guilds.cache.get(settingsc.serverID)
          guild.members.cache.get(botdata.botID).roles.remove(roles.certified_bot);
          guild.members.cache.get(botdata.ownerID).roles.remove(roles.certified_developer);
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
          new codesSchema({
              code: kod,
              codeName: rBody['codename'],
              codeCategory: rBody['category'],
              codeDesc: rBody['codedesc'],
          }).save()
          if(rBody['main']) {
            await codesSchema.findOneAndUpdate({code: kod, codeName: rBody['codename'], codeDesc: rBody['codedesc'], codeCategory: rBody['category']}, {$set: {main: rBody['main']}}, {upsert:true})
          }
          if(rBody['commands']) {
            await codesSchema.findOneAndUpdate({code: kod, codeName: rBody['codename'], codeDesc: rBody['codedesc'], codeCategory: rBody['category']}, {$set: {commands: rBody['commands']}}, {upsert:true})
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
        if(!settingsc.owner.includes(req.user.id)) return res.redirect('../admin');
        let bandata = await banSchema.find();
        renderTemplate(res, req, "/admin/administrator/maintence.ejs", { req, roles, config, bandata })
      });
      app.post("/admin/maintence", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!settingsc.owner.includes(req.user.id)) return res.redirect('../admin');
        let bakimdata = await maintenceSchema.findOne({ server: settingsc.serverID });
        if(bakimdata) return res.redirect('../admin/maintence?error=true&message=Maintenance mode has already been activated for this site.');
        client.channels.cache.get(channels.webstatus).send(`<a:maintence:833375738547535913> vCodes has been switched to __maintance__ due to **${req.body.reason}**`).then(a => { 
            new maintenceSchema({server: settingsc.serverID, reason: req.body.reason, bakimmsg: a.id}).save();
        })
        return res.redirect('../admin/maintence?success=true&message=Maintence opened.');
      });
      app.post("/admin/unmaintence", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        const dc = require("discord.js");
        if(!settingsc.owner.includes(req.user.id)) return res.redirect('../admin');
        let bakimdata = await maintenceSchema.findOne({ server: settingsc.serverID });
        if(!bakimdata) return res.redirect('../admin/maintence?error=true&message=The website is not in maintenance mode anyway.');
        const bakimsonaerdikardesvcodes = new dc.MessageEmbed()
        .setAuthor("vcodes.xyz", client.user.avatarURL())
        .setThumbnail(client.user.avatarURL())
        .setColor("GREEN")
        .setDescription(`<a:online:833375738785824788> vCodes are **active** again!\n[Click to redirect website](https://vcodes.xyz)`)
        .setFooter("vCodes © All rights reserved.");
        await client.channels.cache.get(channels.webstatus).messages.fetch(bakimdata.bakimmsg).then(a => { a.edit(`~~ <a:maintence:833375738547535913> vCodes has been switched to __maintance__ due to **${bakimdata.reason}** ~~`, bakimsonaerdikardesvcodes) } )
        client.channels.cache.get(channels.webstatus).send(".").then(b => { b.delete({ timeout: 500 })})
        await maintenceSchema.deleteOne({server: settingsc.serverID}, function (error, server) { 
        if(error) console.log(error)
        });
        return res.redirect('../admin/maintence?success=true&message=Maintenance mode has been shut down successfully.');
      });
      app.get("/admin/userban", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!settingsc.owner.includes(req.user.id)) return res.redirect('../admin');
        let bandata = await banSchema.find();
        renderTemplate(res, req, "/admin/administrator/user-ban.ejs", { req, roles, config, bandata })
      });
      app.post("/admin/userban", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!settingsc.owner.includes(req.user.id)) return res.redirect('../admin');
        new banSchema({ user: req.body.userID, sebep: req.body.reason, yetkili: req.user.id }).save()
        return res.redirect('../admin/userban?success=true&message=User banned.');
      });
      app.post("/admin/userunban", checkMaintence, checkAdmin, checkAuth, async (req, res) => {
        if(!settingsc.owner.includes(req.user.id)) return res.redirect('../admin');
        banSchema.deleteOne({ user: req.body.userID }, function (error, user) { 
        if(error) console.log(error)
        })
        return res.redirect('../admin/userban?success=true&message=User ban removed.');
      });
      //---------------- ADMIN ---------------\\
  
    //------------------- PROFILE -------------------//
    
    const profiledata = require("./models/profile.js");
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
      rBody = req.body;
  await profiledata.findOneAndUpdate({userID: req.user.id}, {$set: {biography: rBody['biography']}}, {upsert:true})
  await profiledata.findOneAndUpdate({userID: req.user.id}, {$set: {website: rBody['website']}}, {upsert:true})
  await profiledata.findOneAndUpdate({userID: req.user.id}, {$set: {github: rBody['github']}}, {upsert:true})
  await profiledata.findOneAndUpdate({userID: req.user.id}, {$set: {twitter: rBody['twitter']}}, {upsert:true})
  await profiledata.findOneAndUpdate({userID: req.user.id}, {$set: {instagram: rBody['instagram']}}, {upsert:true})
      return res.redirect('?success=true&message=Your profile has been successfully edited.');
    });
    //------------------- PROFILE -------------------//
    app.set('json spaces', 2)
     //------------------- API  -------------------//
     app.get("/api/:botID", async (req, res) => {
      const botdata = await botsdata.findOne({ botID: req.params.botID })
      if(!botdata) res.json({ error: true, message: "This bot id invalid.", errorcode: 404})
      res.header("Content-Type",'application/json');
      res.json(botdata);
    });
    app.get("/api/:botID/voted/:userID", async (req, res) => {
      const votedatas = require("./models/botlist/vote.js");
      const bots = await botsdata.findOne({ botID: req.params.botID })
      const botdata = await votedatas.findOne({ bot: req.params.botID, user: req.params.userID })
      if(!bots) return res.json({ error: true, message: "This bot id invalid.", errorcode: 404});
      res.header("Content-Type",'application/json');
      if(botdata) {
      res.json({user: req.params.userID, hasvote: true});
      } else {
      res.json({user: req.params.userID, hasvote: false});
      }
    });
    app.get("/api/search/:search", async (req, res) => {
      const votedatas = require("./models/botlist/vote.js");
      const botdata = await botsdata.find()
      res.header("Content-Type",'application/json');
      botdata.map(a => {
      if(a.username.toLowerCase().includes(req.params.search.toLocaleLowerCase()) || a.shortDesc.toLowerCase().includes(req.params.search.toLowerCase())) {
          res.json({ botID: a.botID, votes: a.votes, owner: a.ownerName, ownerID: a.ownerID, coowners: a.coowners})
      } else {
          res.json({ error: true, message: "Search result not founded.", errorcode: 404})
      }
      })
      app.post("/api/search", async (req,res) =>{
        const botdata = await botsdata.find()
        let key = req.body.key;
        if (key.length <=0) return res.json({status: true, data: []});
        let data = botdata.filter(d => d.status == "Approved" && d.username.toLowerCase().includes(key.toLowerCase())).sort(function (a,b) { return b - a.votes; });
        res.json({status: true, data: data});
    
    })
    });
    //------------------- API -------------------//
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
  function makeidd(length) {
      var result           = '';
      var characters       = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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
  
