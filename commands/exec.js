const Discord = require('discord.js');
const { exec } = require('child_process');
const hastebin = require("hastebin-gen");
const c = require("../settings.json");
exports.run = async(client, message, args) => {
if(!c.owner.includes(message.author.id)) return  message.reply('could not be granted access permission.')
const msg = message;
const zaman = Date.now()
const kode = args.join(' ')
if(!kode) return msg.channel.send('Yürütülecek parametre yok. 🤦‍♂️');
exec(kode, async (err, sonuç, hata) => {
    
if(sonuç){
if(sonuç.length > 2047) {
hastebin(sonuç, { extension: "js" }).then(cıkra => { msg.channel.send('Bir hata oluştu Embedi atamıyorum '+cıkra+''); })
return
}
Gönder(sonuç, msg.channel.id)

}else if(hata){
if(hata.length > 2047) {
 hastebin(hata, { extension: "js" }).then(cıkra => { msg.channel.send('Bir hata oluştu Embedi atamıyorum '+cıkra+''); })
return
 }
 Gönder(hata, msg.channel.id)

}else{
 msg.channel.send('Komut başarıyla yürütüldü ancak hiçbir çıktı döndürmedi.')
}
msg.channel.send(Date.now() - zaman)
});
    
async function Gönder(text, channel){
let embed = new Discord.MessageEmbed()
.setColor('RANDOM')
.setDescription(text)
msg.guild.channels.cache.get(channel).send(embed)
}
};
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};
exports.help = {
  name: 'exec',
  description: '',
  usage: ''
};