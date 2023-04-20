const app = require("express").Router();
const Database = require("quick.db");
const path = require("path");

console.log("[vcodes.xyz]: Partners router loaded.");

app.get("/partners", async (req, res) => {
  res.render("partners.ejs", {
    bot: global.Client,
    path: req.path,
    config: global.config,
    user: req.isAuthenticated() ? req.user : null,
    req: req,
    db: Database,
    roles: global.config.server.roles,
  });
});

module.exports = app;
