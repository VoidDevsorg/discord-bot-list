const app = require("express").Router();
const channels = global.config.server.channels,
  roles = global.config.server.roles;
const path = require("path");
console.log("[vcodes.xyz]: Admin/Partner router loaded.");
const client = global.Client;
const partnerdb = require(`${process.cwd()}/src/database/models/partners.js`);

app.get("/admin/partners", global.checkAuth, async (req, res) => {
  if (!config.bot.owners.includes(req.user.id)) return res.redirect("../admin");
  let x = await partnerdb.find(); 
  res.render("admin/administrator/partners.ejs", {
    bot: global.Client,
    path: req.path,
    config: global.config,
    user: req.isAuthenticated() ? req.user : null,
    req: req,
    roles: global.config.server.roles,
    channels: global.config.server.channels,
    partners: x,
  });
});
app.post("/admin/partners", global.checkAuth, async (req, res) => {
  try {
  if (!config.bot.owners.includes(req.user.id)) return res.redirect("../admin");
  await new partnerdb({
    code: createID(36),
    icon: req.body.icon || null,
    ownerID: req.body.ownerID || null,
    serverName: req.body.serverName || null,
    website: req.body.Website || null,
    description: req.body.partnerDesc || null,
  }).save();
  let x = client.guilds.cache
    .get(config.server.id)
    .members.cache.get(req.body.ownerID);
  if (x) {
    x.roles.add(roles.profile.partnerRole);
  }
  return res.redirect("/admin/partners?success=true&message=Partner added.");
  } catch (e) {
    console.log(e);
    return res.redirect("/admin/partners?error=true&message=An unknown error occurred.");
  }
});

module.exports = app;

function createID(length) {
  var result = "";
  var characters = "123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
