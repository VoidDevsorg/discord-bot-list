const app = require("express").Router();
const botsdata = require("../../database/models/botlist/bots.js");
const client = global.Client;
const channels = global.config.server.channels;

console.log("[vcodes.xyz]: Botlist/Vote router loaded.");

app.get("/bot/:botID/vote", async (req, res) => {
  let botdata = await botsdata.findOne({
    botID: req.params.botID,
  });
  if (!botdata)
    return res.redirect(
      "/error?code=404&message=You entered an invalid bot id."
    );
  if (req.user) {
    if (
      !req.user.id === botdata.ownerID ||
      req.user.id.includes(botdata.coowners)
    ) {
      if (botdata.status != "Approved")
        return res.redirect(
          "/error?code=404&message=You entered an invalid bot id."
        );
    }
  }
  res.render("botlist/vote.ejs", {
    bot: global.Client,
    path: req.path,
    config: global.config,
    user: req.isAuthenticated() ? req.user : null,
    req: req,
    botdata: botdata,
    roles: global.config.server.roles,
    channels: global.config.server.channels,
  });
});
app.post("/bot/:botID/vote", global.checkAuth, async (req, res) => {
  const votes = require("../../database/models/botlist/vote.js");
  let botdata = await botsdata.findOne({
    botID: req.params.botID,
  });
  let x = await votes.findOne({
    user: req.user.id,
    bot: req.params.botID,
  });
  if (x)
    return res.redirect("/error?code=400&message=You can vote every 12 hours.");
  await votes.findOneAndUpdate(
    {
      bot: req.params.botID,
      user: req.user.id,
    },
    {
      $set: {
        Date: Date.now(),
        ms: 43200000,
      },
    },
    {
      upsert: true,
    }
  );
  await botsdata.findOneAndUpdate(
    {
      botID: req.params.botID,
    },
    {
      $inc: {
        votes: 1,
      },
    }
  );
  if (botdata.dcwebhook) {
    const webhook = require("webhook-discord");

    const Hook = new webhook.Webhook(botdata.dcwebhook);
    const msg = new webhook.MessageBuilder()
      .setName("Vcodes Votes Manager")
      .setAvatar(client.user.displayAvatarURL())
      .setAuthor(
        "Vote Logs",
        client.user.displayAvatarURL(),
        "https://vcodes.xyz"
      )
      .setColor("#800080")
      .addField(
        `\`${botdata.username}\` just got upvoted!`,
        `**VoterID:** ${req.user.id}\n**VoterTag:** ${req.user.username}#${
          req.user.discriminator
        }\n**Total Votes:** ${botdata.votes + 1}`
      );
    Hook.send(msg);
  }
  if (botdata.webhook) {
    const fetch = require("node-fetch");

    var requestOptions = {
      method: "POST", // Choose the appropriate method
      headers: {
        authorization: `${botdata.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: `${req.user.username}`,
        bot: `${botdata.username}`,
        votes: `${botdata.votes + 1}`,
        test: "no",
      }), // Replace this number with the server count
    };
    await fetch(botdata.webhook, requestOptions);
  }
  client.channels.cache
    .get(channels.votes)
    .send(
      `**${req.user.username}** voted **${botdata.username}** **\`(${
        botdata.votes + 1
      } votes)\`**`
    );
  if (botdata.votes + 1 >= 100) {
    client.channels.cache
      .get(channels.votes)
      .send(
        `:tada: The bot named **${botdata.username}** has reached 100 votes!`
      );
  }
  return res.redirect(
    `/bot/${req.params.botID}/vote?success=true&message=You voted successfully. You can vote again after 12 hours.`
  );
});

module.exports = app;
