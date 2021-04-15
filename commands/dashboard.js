const Discord = require('discord.js');
const data = require('../models/site-ban.js');
const databakim = require('../models/bakim.js');
const c = require("../settings.json");
const ch = require("../channels.json");
exports.run = async (client,message,args) => {
if(!c.owner.includes(message.author.id)) return  message.reply('could not be granted access permission.')
if(!args[0]) return message.reply("You must enter an argument.\nUsing: [prefix]dashboard <arg>\nArgs: `ban`, `unban`, `maintence open [reason]`, `maintence close`")
if(args[0] == "ban") {
  let member = message.mentions.members.first() || args[1];
  let sebep = args.slice(2).join(" ") ? args.slice(2).join(" ") : 'Unspecified';
  if(!member) return message.reply("tag a member or write a userID");
  client.users.fetch(member.id || member).then(a => {
  const tebriklerkanks = new Discord.MessageEmbed()
  .setAuthor(a.tag, a.avatarURL({dynamic: true}))
  .setThumbnail(client.user.avatarURL())
  .setDescription(`Congratulations, you have blocked ${a.tag} from **panel access** for **__${sebep}__**.`)
  .setColor("GREEN")
  .setTitle("SUCCESSFUL")
  message.channel.send(tebriklerkanks);
  new data({user: a.id, sebep: sebep, yetkili: message.author.id}).save()
  });
}
if(args[0] == "unban") {
  let member = message.mentions.members.first() || args[1];
  if(!member) return message.reply("tag a member or write a userID");
  client.users.fetch(member.id || member).then(a => {
  const tebriklerkanks = new Discord.MessageEmbed()
  .setAuthor(a.tag, a.avatarURL({dynamic: true}))
  .setThumbnail(client.user.avatarURL())
  .setDescription(`Congratulations, you have unlocked the **panel access** block of the user **${a.tag}**.`)
  .setColor("GREEN")
  .setTitle("SUCCESSFUL")
  message.channel.send(tebriklerkanks);
  data.deleteOne({user: a.id}, function (error, user) { 
  if(error) console.log(error)
  })
  });
}

if(args[0] == "maintence") {
if(args[1] == "open") {
    const d = await databakim.findOne({server: message.guild.id});
    if(d) return message.reply("the site is already under maintenance.")
    let reason = args.slice(2).join(" ");
    if(!reason) return message.reply("you have to enter a reason.");
    const tebriklerkanks = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
    .setThumbnail(client.user.avatarURL())
    .setDescription(`Congratulations, You **shut down** the site for\`${reason}\``)
    .setColor("GREEN")
    .setTitle("SUCCESSFUL")
    message.channel.send(tebriklerkanks);
    const bakimmesaj = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
    .setThumbnail(client.user.avatarURL())
    .setDescription("Website: **maintenance** mode has been activated!")
    .addField("Authorized", message.author)
    .addField("Reason", reason)
    .setColor("BLUE")
    client.channels.cache.get(ch.webstatus).send(`vCodes has been switched to __maintance__ due to **${reason}**`).then(a => { 
        new databakim({server: message.guild.id, reason: reason, bakimmsg: a.id}).save();
    })
}
if(args[1] == "close") {
    const d = await databakim.findOne({server: message.guild.id});
    if(!d) return message.reply("site zaten bakıma alınmamış.")
    const tebriklerkanks = new Discord.MessageEmbed()
    .setAuthor("vcodes.xyz", client.user.avatarURL())
    .setThumbnail(client.user.avatarURL())
    .setDescription(`Congratulations, You re-opened website that were closed due to the reason **${d.reason}** .`)
    .setColor("GREEN")
    .setTitle("BAŞARILI")
    message.channel.send(tebriklerkanks);
    client.channels.cache.get(ch.webstatus).messages.fetch(d.bakimmsg).then(a => { a.edit(`~~ Website: **maintenance** mode has been activated! ~~`, bakimbitti) } )
    const bakimbitti = new Discord.MessageEmbed()
    .setAuthor("vcodes.xyz", client.user.avatarURL())
    .setThumbnail(client.user.avatarURL())
    .setColor("GREEN")
    .setDescription(`vCodes are **active** again!\n[Click to redirect website](https://vcodes.xyz)`)
    .setFooter("vCodes © All rights reserved.");
    client.channels.cache.get(ch.webstatus).send(".").then(b => { b.delete({ timeout: 500 })})
    databakim.deleteOne({server: message.guild.id}, function (error, server) { 
    if(error) console.log(error)
    });
}
}

}
module.exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["dashboard"],
  };
  
  module.exports.help = {
    name: "dashboard",
    description: "",
    usage: ""
  };
