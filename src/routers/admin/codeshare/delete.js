const app = require('express').Router();
const codesSchema = require("../../../database/models/codes.js");
const client = global.Client;
const channels = global.config.server.channels,
	  roles = global.config.server.roles;

console.log("[vcodes.xyz]: Admin/CodeShare/Delete router loaded.");

app.post("/admin/deletecode/:code", global.checkAuth, async (req, res) => {
    const rBody = req.body;
    let kod = req.params.code;
    let kodDataFind = await codesSchema.findOne({ code: kod });
    if(!kodDataFind) return res.redirect('/admin/codes');
    client.channels.cache.get(channels.codelog).send(new Discord.MessageEmbed()
        .setTitle("Code deleted!").setColor("GREEN").setFooter(config.footer)
        .setDescription(`The user named **[${req.user.username}](https://vcodes.xyz/user/${req.user.id})** deleted the code named **${kodDataFind.codeName}**.`)
        .addField("Code Category", kodDataFind.codeCategory, true)
    )
    await codesSchema.deleteOne({
        code: kod
    })
    res.redirect('/codes')
});

module.exports = app;