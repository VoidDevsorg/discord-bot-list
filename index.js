/*=======================================================================================*/
const Discord = require("discord.js");
const { Client, Collection } = require("discord.js");
const client = (global.Client = new Client({ intents: 32767, allowedMentions: { repliedUser: false } }));
const config = require("./config.js");
global.config = config;
const fs = require("fs");
client.htmll = require("cheerio");
const request = require("request");
const db = require("quick.db");
const botsdata = require("./src/database/models/botlist/bots.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const ms = require("parse-ms");

const _commands = [];
client.commands = new Discord.Collection()

/*=======================================================================================*/

fs.readdir(`${process.cwd()}/src/commands`, (err, commands) => {
  if (err) throw new Error(err);
  commands.map(async command => {
    try {
      const _cmdFile = require(`${process.cwd()}/src/commands/${command}`);
      const { name, description, options } = (
        typeof _cmdFile == "function" ?
          _cmdFile(client) :
          _cmdFile
      );
      _commands.push({ name, description, options });
      await client.commands.set(name, _cmdFile);
    } catch (err) {
      console.error(err);
    };
  });
});

/*=======================================================================================*/

/*=======================================================================================*/
const claudette = require("./src/database/models/uptime.js");
setInterval(() => {
  claudette.find({}, function (err, docs) {
    if (err) console.log(err);
    if (!docs) return;
    docs.forEach((docs) => {
      request(docs.link, async function (error, response, body) {
        if (error) {
          console.error(
            `${docs.link} has been deleted on uptime system.\nReason: Invalid domain so request failed.`
          );
          await claudette.findOneAndDelete({ code: docs.code });
        }
      });
    });
  });
}, 60000);

client.on("guildMemberRemove", async (member) => {
  if (member.guild.id !== config.serverID) return;
  claudette.find({ userID: member.id }, async function (err, docs) {
    await docs.forEach(async (a) => {
      await claudette.findOneAndDelete({
        userID: member.id,
        code: a.code,
        server: a.server,
        link: a.link,
      });
    });
  });
});
/*=======================================================================================*/

global.commands = _commands;
const rest = new REST({ version: "9" }).setToken(config.bot.token);
client.on("ready", async () => {
  await rest.put(Routes.applicationCommands(client.user.id), { body: _commands });

  setInterval(async () => {
    var botdata = await botsdata.find();
    botdata.forEach((rnxd) => {
      let chekb = db.fetch(`timefr_${rnxd.botID}`);
      if (!chekb) {
        db.set(`timefr_${rnxd.botID}`, Date.now());
      }
    });
  }, 5000);
  setInterval(async () => {
    let target = db.fetch(`targetv`);
    if (!target) return;
    var botdata = await botsdata.find();
    botdata.forEach((rnxd) => {
      if (rnxd.votes === target) {
        db.delete(`targetv`);
        client.channels.cache
          .get("876784483565715466")
          .send({
            content: `:tada: :tada: <@${rnxd.botID}> has Reached the Vote Target of ${target} Owner of Bot: <@${rnxd.ownerID}> :tada: :tada:`
        });
      }
    });
  }, 20000);
});
/*=======================================================================================*/

client.on("interactionCreate", async interaction => {
  try {
    if (!interaction.isCommand()) return;

    fs.readdir(`${process.cwd()}/src/commands`, (err, commands) => {
      if (err) throw new Error(err);
      commands.forEach(async command => {
        const _command = require(`${process.cwd()}/src/commands/${command}`);
                
        if (interaction.commandName.toLowerCase() === _command.name.toLowerCase()) _command.run(client, interaction);
      });
    });
  } catch (err) {
    console.error(err);
  };
});

/*=======================================================================================*/
const votes = require("./src/database/models/botlist/vote.js");
const votesServer = require("./src/database/models/servers/user.js");
client.on("ready", async () => {
  setInterval(async () => {
    let datalar = await votes.find();
    if (datalar.length > 0) {
      datalar.forEach(async (a) => {
        let süre = a.ms - (Date.now() - a.Date);
        if (süre > 0) return;
        await votes.findOneAndDelete({ bot: a.bot, user: a.user });
      });
    }
  }, 1500000);
});
client.on("ready", async () => {
  setInterval(async () => {
    let voteServer = await votesServer.find();
    if (voteServer.length > 0) {
      voteServer.forEach(async (a) => {
        let süre = 1800000 - (Date.now() - a.date);
        if (süre > 0) return;
        await votesServer.findOneAndDelete({
          guild: a.guild,
          id: a.id,
          date: a.date,
        });
      });
    }
  }, 1500000);
});
/*=======================================================================================*/

/*=======================================================================================*/
client.on("guildMemberRemove", async (member) => {
  const botlar = require("./src/database/models/botlist/bots.js");
  let data = await botlar.findOne({ ownerID: member.id });
  if (!data) return;
  let find = await botlar.find({ ownerID: member.id });
  await find.forEach(async (b) => {
    member.guild.members.cache.get(b.botID).kick();
    await botlar.deleteOne({ botID: b.botID });
  });
});
client.on("guildMemberAdd", async (member) => {
  let guild = client.guilds.cache.get(config.server.id);
  if (member.user.bot) {
    try {
      guild.member(member.id).roles.add(config.server.roles.botlist.bot);
    } catch (error) {}
  }
});
/*=======================================================================================*/

/*
    SERVER LIST CLIENT 
*/
const serverClient = new Client({ intents: 32767 });
serverClient.login(config.bot.servers.token);
global.clientSL = serverClient;
require("./src/servers/client.js");

/*=======================================================================================*/
require("./src/server.js")(client);
require("./src/database/connect.js")(client);

client.login(config.bot.token);
client.on("ready", async () => {
  console.log(
    "[vcodes.xyz]: Bot successfully connected as " + client.user.tag + "."
  );
  let botsSchema = require("./src/database/models/botlist/bots.js");
  const bots = await botsSchema.find();
  client.user.setStatus("dnd");
  client.user.setPresence({ activities: [{ name: "vcodes.xyz | " + bots.length + " bots" }] });
});
/*=======================================================================================*/

/* RESET DATA'S EVERY MONTHS */

// BOT/SERVER VOTES & ANALYTICS
const { CronJob } = require("cron");
const botlar = require("./src/database/models/botlist/bots.js");
const servers = require("./src/database/models/servers/server.js");
client.on("ready", async () => {
  var resetStats = new CronJob(
    "00 00 1 * *",
    async function () {
      let x = await botlar.find();
      await x.forEach(async (a) => {
        await botlar.findOneAndUpdate(
          {
            botID: a.botID,
          },
          {
            $set: {
              votes: 0,
              analytics_invites: 0,
              analytics_visitors: 0,
              country: {},
              analytics: {},
            },
          }
        );
      });
      let sunucular = await servers.find();
      await sunucular.forEach(async (a) => {
        await servers.findOneAndUpdate(
          {
            id: a.id,
          },
          {
            $set: {
              votes: 0,
              bumps: 0,
              analytics_joins: 0,
              analytics_visitors: 0,
              country: {},
              analytics: {},
            },
          }
        );
      });
    },
    null,
    true,
    "Europe/Istanbul"
  );
  resetStats.start();
});
