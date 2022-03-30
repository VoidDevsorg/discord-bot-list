const botsdata = require("../database/models/botlist/bots.js");
const codesSchema = require("../database/models/codes.js");
const uptimedata = require("../database/models/uptime.js");
const appsdata = require("../database/models/botlist/certificate-apps.js");
const Discord = require('discord.js');
const { Client, Message, MessageEmbed } = require("discord.js")
const vcodes = require("vcodes.js");
let sitedatalari = require("../database/models/analytics-site.js");

const roles = global.config.server.roles;
const channels = global.config.server.channels;
const client = global.Client;

module.exports.run = async (client,message,args) => {
  if(!message.member.permissions.has('ADMINISTRATOR')) return await message.reply("I think you are not a member of staff team and if you are then you are trying this command in wrong guild.")
  id=(message.mentions.members.first()).user.id || args.slice(0,1);
  if(!id) return await message.reply("Mention a bot to approve.")
  feedback=args.slice(1).join(' ');
  const botdata = await botsdata.findOne({
        botID: id
    })
  if (!botdata) return await message.reply("NO SUCH BOT FOUND.")
  await botsdata.findOneAndUpdate({
    botID: id
  }, {
      $set: {
        status: "Approved",
        Date: Date.now(),
      }
    }, function(err, docs) {})
  client.users.fetch(id).then(bota => {
    if(!feedback) {
       let embed = new Discord.MessageEmbed()
        .setDescription(`<@${botdata.ownerID}>'s bot named <@${botdata.botID}> \nHas Been Approved by <@${message.author.id}>`)

        let embed2 = new Discord.MessageEmbed()
        .setDescription(`Your bot named **${bota.tag}** \nHas been Approved by <@${message.author.id}>`)
      client.channels.cache.get(channels.botlog).send(embed)
        client.users.cache.get(botdata.ownerID).send(embed2)
          let guild = client.guilds.cache.get(config.server.id)
            guild.members.cache.get(botdata.botID).roles.add(roles.botlist.bot);
      guild.members.cache.get(botdata.ownerID).roles.add(global.config.server.roles.botlist.developer);
      if (botdata.coowners) {
        botdata.coowners.map(a => {
          guild.members.cache.get(a).roles.add(roles.botlist.developer);
        })
      }
      return message.reply(`Successfully approved the bot.`)
    } else if(feedback) {
      client.channels.cache.get(channels.botlog).send(`<@${botdata.ownerID}>'s bot named <@${botdata.botID}> has been approved by <@${message.author.id}>\nfeedback: ${feedback}`)
        client.users.cache.get(botdata.ownerID).send(`Your bot named **${bota.tag}** has been approved by <@${message.author.id}>\nfeedback: ${feedback}`)
          let guild = client.guilds.cache.get(config.server.id)
            guild.members.cache.get(botdata.botID).roles.add(roles.botlist.bot);
      guild.members.cache.get(botdata.ownerID).roles.add(global.config.server.roles.botlist.developer);
      if (botdata.coowners) {
        botdata.coowners.map(a => {
          guild.members.cache.get(a).roles.add(roles.botlist.developer);
        })
      }
      return message.reply(`Successfully approved the bot.`)
    }
  
})
};
exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
};
  
exports.help = {
    name: "approve",
    description: "",
    usage: ""
};
