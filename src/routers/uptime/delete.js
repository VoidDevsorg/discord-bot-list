const app = require('express').Router();
const path = require("path");
const uptimedata = require("../../database/models/uptime.js");
const roles = global.config.server.roles,
      channels = global.config.server.channels;
const client = global.Client;
const Discord = require("discord.js");

console.log("[vcodes.xyz]: Uptime/Delete router loaded.");

app.get("/:code/delete", global.checkAuth, async (req, res) => {
                const dde = await uptimedata.findOne({
                    code: req.params.code
                });
                if (!dde) return res.redirect('/uptime/links?error=true&message=There is no such site in the system.')
                uptimedata.findOne({
                    'code': req.params.code
                }, async function(err, docs) {
                    if (docs.userID != req.user.id) return res.redirect('/uptime/links?error=true&message=The link you tried to delete does not belong to you.');
                    res.redirect('/uptime/links?success=true&message=The link has been successfully deleted from the system.');
                    await uptimedata.deleteOne({
                        code: req.params.code
                	});
				})
})

module.exports = app;