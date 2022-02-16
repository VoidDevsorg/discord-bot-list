// This may crash your server if you are using Replit.

const Discord = require('discord.js');
const fetch = require("node-fetch");
exports.run = (client, message, args) => {
    if(!global.config.bot.owners.includes(message.author.id)) return  message.reply('You dont have permission to use this command')
	message.channel.send("vCodes: The bot is now rebooting").then(msg => {
		console.log(`BOT: Restarting from Reboot Command`);
		process.exit(1);
	})
};
exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: []
};
exports.help = {
	name: 'reboot',
	description: 'Reboots the bot',
	usage: 'reboot'
};
