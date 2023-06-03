const Discord = require("discord.js");
const serverClient = global.clientSL;
const config = global.config;
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const _commands = [];
serverClient.commands = new Discord.Collection();

fs.readdir(`${process.cwd()}/src/servers/commands`, (err, commands) => {
  if (err) throw new Error(err);
  commands.map(async command => {
    try {
      const _cmdFile = require(`${process.cwd()}/src/servers/commands/${command}`);
      const { name, description, options } = (
        typeof _cmdFile == "function" ?
          _cmdFile(serverClient) :
          _cmdFile
      );
      _commands.push({ name, description, options });
      await serverClient.commands.set(name, _cmdFile);
    } catch (err) {
      console.error(err);
    };
  });
});

global.SLCommands = _commands;
const rest = new REST({ version: "9" }).setToken(config.bot.servers.token);
serverClient.on("ready", async () => {
  await rest.put(Routes.applicationCommands(serverClient.user.id), { body: _commands });

  console.log(
    "[vcodes.xyz/servers]: Bot successfully connected as " +
      serverClient.user.tag +
      "."
  );
  serverClient.user.setStatus("dnd");
  serverClient.user.setPresence({ activities: [{ name: "/bump & /vote | vcodes.xyz/servers" }] });
});

serverClient.on("interactionCreate", async interaction => {
  try {
    if (!interaction.isCommand()) return;

    fs.readdir(`${process.cwd()}/src/servers/commands`, (err, commands) => {
      if (err) throw new Error(err);
      commands.forEach(async command => {
        const _command = require(`${process.cwd()}/src/servers/commands/${command}`);
                
        if (interaction.commandName.toLowerCase() === _command.name.toLowerCase()) _command.run(serverClient, interaction);
      });
    });
  } catch (err) {
    console.error(err);
  };
});

serverClient.makeid = (length) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports = serverClient;
