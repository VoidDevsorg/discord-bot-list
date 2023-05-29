const app = require("express").Router();
const db = require("../../database/models/servers/server.js");
const client = global.clientSL;
const channels = global.config.server.channels;

console.log("[vcodes.xyz/servers]: Add Server router loaded.");

app.get("/add", global.checkAuth, async (req, res) => {
  if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id))
    return res.send({ error: true, message: "To do this, you have to join our discord server." });
  res.render("servers/add.ejs", {
    bot: global.clientSL,
    path: req.path,
    config: global.config,
    user: req.isAuthenticated() ? req.user : null,
    req: req,
    roles: global.config.server.roles,
    channels: global.config.server.channels,
  });
});
app.post("/add", global.checkAuth, async (req, res) => {
  let { guildID, link, autoCreate, shortDesc, longDesc, tags } = req.body;
  const guild = client.guilds.cache.get(req.body.guildID);
  let checkGuild = await db.findOne({ id: guildID });
  if (checkGuild)
    return res.send({
      error: true,
      message: "This server already exist system.",
    });
  if (!guildID || !longDesc || !shortDesc || !tags)
    return res.send({ error: true, message: "Please enter all fields."});
  if (!link && !autoCreate)
    return res.send({ error: true, message: "Please enter a link or select auto create." });
  if (!guild)
    return res.send({ error: true, message: "Please enter a valid guild ID." });
  const member = guild.members.cache.get(req.user.id);
  if (!member) {
    try {
      await guild.members.fetch();
      member = guild.members.cache.get(req.user.id);
    } catch (err) {
      res.send({ error: true, message: "An error occurred while fetching guild members." });
    }
  }
  if (!member)
    return res.send({ error: true, message: "You can only add servers with ADMINISTRATOR authorization." });
  if (!member.permissions.has("ADMINISTRATOR"))
    return res.send({ error: true, message: "You can only add servers with ADMINISTRATOR authorization." });
  await db.updateOne(
    {
      id: guildID,
    },
    {
      $set: {
        name: guild.name,
        icon: guild.iconURL({ dynamic: true }),
        ownerID: guild? guild.ownerID : req.user.id,
        longDesc: req.body.longDesc,
        shortDesc: req.body.shortDesc,
        tags: req.body.tags,
        votes: 0,
      },
    },
    { upsert: true }
  );

  if (autoCreate === "true") {
    const channel = guild.channels.cache.find((ch) => ch.type === "GUILD_TEXT" && ch.permissionsFor(guild.me).has("SEND_MESSAGES"));
    if (!channel) return res.send({ error: true, message: "I can't find any channel to send message." });
    const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 }).catch((err) => {
      console.log(err);
      return res.send({ error: true, message: "An error occurred while creating an invitation." });
    });
    await db.updateOne(
      {
        id: guildID,
      },
      {
        $set: {
          link: invite.url,
        },
      },
      { upsert: true }
    );

  } else {
    await db.updateOne(
      {
        id: guildID,
      },
      {
        $set: {
          link: link,
        },
      },
      { upsert: true }
    );
  }
  await res.send({ success: true, message: "Your server has been successfully added." });
});

module.exports = app;
