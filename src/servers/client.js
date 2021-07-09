const Discord = require("discord.js");
const { Client, Collection } = require("discord.js");
const serverClient = global.clientSL;
const config = global.config;
const fs = require("fs");
const { createCanvas } = require('canvas')
const { MessageButton } = require("discord-buttons");

require('discord-buttons')(serverClient);
serverClient.on('clickButton', async (button) => {
    button.defer(true);
});

require('events').EventEmitter.prototype._maxListeners = 100;
serverClient.commands = new Discord.Collection();
serverClient.aliases = new Discord.Collection();
fs.readdir("./src/servers/commands/", (err, files) => {
  if (err) console.error(err);
  console.log(`[vcodes.xyz/servers]: ${files.length} command loaded.`);
  files.forEach(async f => {
    let props = require(`./commands/${f}`);
    serverClient.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      serverClient.aliases.set(alias, props.help.name);
    });
  });
});
let serverPrefix = config.bot.servers.prefix;
serverClient.on('message', async message => {
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;
  if (message.content.startsWith(serverPrefix)) {
  let command = message.content.split(' ')[0].slice(serverPrefix.length);
  let params = message.content.split(' ').slice(1);
  let cmd
    if (serverClient.commands.has(command)) {
        cmd = serverClient.commands.get(command);
    } else if (serverClient.aliases.has(command)) {
        cmd = serverClient.commands.get(serverClient.aliases.get(command));
    }
    if(cmd) cmd.run(serverClient, message, params);
    if(!cmd) return;
  }
})


serverClient.on('ready',async () => {
    console.log("[vcodes.xyz/servers]: Bot successfully connected as "+serverClient.user.tag+".");
    serverClient.user.setPresence({ activity: { type: 'WATCHING', name: '-bump & -vote | vcodes.xyz/servers' }, status: "dnd" });
});

serverClient.makeid = length => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

module.exports = serverClient;