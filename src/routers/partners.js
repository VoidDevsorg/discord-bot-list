const app = require("express").Router();
const partnerdb = require(`${process.cwd()}/src/database/models/partners.js`);

console.log("[vcodes.xyz]: Partners router loaded.");

app.get("/partners", async (req, res) => {
  let x = await partnerdb.find({});
  res.render("partners.ejs", {
    bot: global.Client,
    path: req.path,
    config: global.config,
    user: req.isAuthenticated() ? req.user : null,
    req: req,
    partners: x,
    roles: global.config.server.roles,
  });
});

module.exports = app;
