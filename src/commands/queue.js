const botsdata = require("../database/models/botlist/bots.js");
const Discord = require('discord.js');
const vcodes = require("vcodes.js");
const roles = global.config.server.roles;
const channels = global.config.server.channels;
const client = global.Client;

module.exports.run = async (client, message) => {
  if (!message.member.roles.cache.has(roles.moderator)) return await message.reply("I think you are not a member of staff team.")
  let x = await botsdata.find();
  let bots = await x.filter(a => a.status === "UnApproved")

  try {
    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
      .setDescription(`**Total ${bots.length} bots in queue.**`)
      .setColor("#7289da")
      .addField("Bots", `${!bots ? "" : bots.map(a => `bot:${a.username}\nbot invite link (default url): [CLICK Here](https://vcodes.xyz/bot/${a.botID}/invite)\nperm 0 link: [PERM 0](https://discord.com/api/oauth2/authorize?client_id=${a.botID}&permissions=0&scope=bot%20applications.commands)`).join("\n")}`, true)
    await message.channel.send(embed);
  } catch {
    await message.reply(`Total bots in queue ${bots.length}`)
  }

};
exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
};

exports.help = {
  name: "queue",
  description: "",
  usage: ""
};
