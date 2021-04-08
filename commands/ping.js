const Discord = require('discord.js');
const c = require("../settings.json");
const axios = require("axios");
const data = require("../models/botlist/bots.js")
exports.run = async (client, message, args) => {
    let oldDate = Date.now();
    data.findOne({},async (err,docs) => {
let dataping = Date.now() - oldDate
    message.channel.send(":ping_pong: Pong...", new Discord.MessageEmbed()
    .setTitle("vCodes - Ping")
    .setColor("BLUE").setFooter("vCodes © All rights reserved.")
    .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
    .setDescription(`**Bot Ping**: ${client.ws.ping}ms\n**Database**: ${dataping}ms`)
    )
})
}
exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: []
};
exports.help = {
	name: 'ping',
	description: 'ping',
	usage: 'ping'
};
async function site(link,sure) {
    return axios.get(link).then(async a => ((Date.now() - await sure)))
}