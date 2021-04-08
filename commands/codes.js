const Discord = require('discord.js')
const c = require("../settings.json")
const db = require('../models/codes.js')
module.exports.run = async (client,message,args) => {
db.find({}, function (err, docs) { 
const guilds = docs
const generateEmbed = start => {
  
  const current = guilds.slice(start, start + 10)
  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
    .setDescription(`Total ${docs.length} codes are available.`)
    .setColor("BLUE")
    .setFooter(c.footer)
  current.forEach(g => 
    embed.addField(`${g.codeName}`, `[Click Here](https://vcodes.xyz/code/${g.code})`)
  ) 
  return embed
}

const author = message.author

message.channel.send(generateEmbed(0)).then(message => {
  if (guilds.length <= 10) return
  message.react('➡️')
  const collector = message.createReactionCollector(
    (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === author.id,
    {time: 60000}
  )

  let currentIndex = 0
  collector.on('collect', reaction => {
    message.reactions.removeAll().then(async () => {
      reaction.emoji.name === '⬅️' ? currentIndex -= 10 : currentIndex += 10
      message.edit(generateEmbed(currentIndex))
      if (currentIndex !== 0) await message.react('⬅️')
      if (currentIndex + 10 < guilds.length) message.react('➡️')
    })
  })
})
})
};
exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["codes"],
  };
  
  exports.help = {
    name: "kodlar",
    description: "",
    usage: ""
  };
  

