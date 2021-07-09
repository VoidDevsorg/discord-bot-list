const Discord = require("discord.js");
const { MessageButton } = require("discord-buttons");
const { registerFont, createCanvas } = require('canvas');
const serverData = require("../../database/models/servers/server.js");
const userData = require("../../database/models/servers/user.js");
exports.run = async (client, message, args) => {
	let findServer = await serverData.findOne({ id: message.guild.id });
	let findUser = await userData.findOne({ id: message.author.id, guild: message.guild.id });
	if(!findServer) return message.channel.send(
		"This server was not found in our list.\nAdd your server: https://vcodes.xyz/server/add"
	);
  	if (findUser) {
    return await msgError('You can vote only once every 30 minutes.', { channel: message.channel });
	} else {
    let kod1 = client.makeid(6);
    let kod2 = client.makeid(6);
    let kod3 = client.makeid(6);
    const width = 400
    const height = 125
    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')
    await registerFont('src/fonts/font.ttf', { family: 'vCodes' })
    context.fillRect(0, 0, width, height)
    context.font = 'bold 60pt vCodes'
    context.textAlign = 'center'
    context.fillStyle = '#fff'
    context.fillText(kod1, 200, 90)
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'captcha.png'); 
    let sorgu = new MessageButton()
    .setLabel(kod1)
    .setStyle("blurple")
    .setID(kod1)
    let sorgu2 = new MessageButton()
    .setLabel(kod2)
    .setStyle("blurple")
    .setID(kod2)
    let sorgu3 = new MessageButton()
    .setLabel(kod3)
    .setStyle("blurple")
    .setID(kod3)
    let web = new MessageButton()
    .setLabel("Visit server page")
    .setStyle("url")
    .setURL("https://vcodes.xyz/server/"+message.guild.id)

    const incorrectButton = new Discord.MessageEmbed()
	.setTitle("Wrong button selected.")
	.setColor("RED")
	.setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
	.setDescription(`No way, the operation was canceled because you clicked the wrong code.`)
	const correctButton = new Discord.MessageEmbed()
	.setTitle("The correct button has been selected.")
	.setColor("GREEN")
	.setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
	.setDescription(`You have successfully voted for server **${message.guild.name}**.`)
    .setImage('https://img.devsforum.net/tr/img/s9Y2C10.png')

    const controlEmbed = new Discord.MessageEmbed()
    .setTitle("Select the code button that is the same as the picture.")
    .setColor("BLURPLE")
    .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
    .attachFiles(attachment)
    .setImage('attachment://captcha.png')
    .setDescription("Select whichever of the buttons below matches the code and it will perform the operation, this operation will be canceled after **60** seconds.");

    message.channel.send({ embed: controlEmbed, buttons: [ sorgu, sorgu2, sorgu3 ].sort(() => Math.random()-0.5) }).then(async msg => {
		const filter = (button) => button.clicker.user.id === message.author.id;
		const collector = await msg.createButtonCollector(filter, { time: 60000 });
		  collector.on('collect', async b => {
		    if(b.id == kod1) {
            let findUserr = await userData.findOne({ id: message.author.id, guild: message.guild.id });if(findUserr) return msg.delete().then(await msgError('You can vote only once every 30 minutes.', { channel: message.channel }));
		      msg.delete().then( message.channel.send({ embed: correctButton, buttons: [ web ] }) )
		          await userData.updateOne({ 
			    	id: message.author.id 
			      }, { 
			    	$set: { 
			    		guild: message.guild.id,
                        date: Date.now()
			    	}
			   	  }, { upsert: true })
		          await serverData.updateOne({ 
			    	id: message.guild.id 
			      }, { 
			    	$inc: { 
			    		votes: 1
			    	}
			   	  })
			    return;
		    } else if (b.id == kod2 || b.id == kod3) {
		      msg.delete().then( message.channel.send({ embed: incorrectButton, buttons: [ web ] }) )
		    }
		  })
	})
}
};
exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: []
};
exports.help = {
	name: 'vote',
	description: '',
	usage: ''
};

function msgError(msg, { channel }) {
    channel.send(new Discord.MessageEmbed()
    .setAuthor(global.clientSL.user.username,global.clientSL.user.avatarURL())
    .setFooter('vcodes.xyz/servers')
    .setDescription(msg)
    .setColor("RED")
    )
}