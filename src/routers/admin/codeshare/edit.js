const app = require("express").Router();
const codesSchema = require("../../../database/models/codes.js");
const client = global.Client;
const channels = global.config.server.channels,
  roles = global.config.server.roles;

console.log("[vcodes.xyz]: Admin/CodeShare/Edit router loaded.");

app.post("/admin/editcode/:code", global.checkAuth, async (req, res) => {
  const rBody = req.body;
  let kod = req.params.code;
  await codesSchema.findOneAndUpdate(
    {
      code: kod,
    },
    {
      $set: {
        codeName: rBody["codename"],
        codeCategory: rBody["category"],
        codeDesc: rBody["codedesc"],
        main: rBody["main"],
        commands: rBody["commands"],
      },
    },
    function (err, docs) {}
  );
  client.channels.cache
    .get(channels.codelog)
    .send({
      embeds: [
        new Discord.EmbedBuilder()
        .setTitle("Code edited!")
        .setColor("#00ff00")
        .setFooter(config.footer)
        .setDescription(
          `The user named **[${req.user.username}](https://vcodes.xyz/user/${req.user.id})** edited the code named **${rBody["codename"]}**.`
        )
        .addFields([
          { name: "Code Link", value: `https://vcodes.xyz/code/${kod}`, inline: true },
          { name: "Code Description", value: rBody["codedesc"], inline: true },
          { name: "Code Category", value: rBody["category"], inline: true },
        ])
      ]
    });
  res.redirect("/code/" + kod);
});

module.exports = app;
