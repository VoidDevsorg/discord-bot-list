//-------------CLIENT---------\\
const Discord = require("discord.js");
const settings = require("./settings.json");
const { Client, Collection } = require("discord.js");
const client = (global.Client = new Client())
const { Database, DatabaseManager } = require("@aloshai/mongosha")
const canvacord = require('canvacord')
const config = require("./settings.json")
const { connect } = require("mongoose")
const fs = require("fs");
const bansite = require("./models/site-ban.js");
const url = settings.mongoURL;
const fetch = require("node-fetch");
const roles = require("./roles.json")
  
const channels = require("./channels.json")
client.htmll = require('cheerio');

//-------------Database---------------\\

connect(url, {
useNewUrlParser: true,
useUnifiedTopology: true,
useFindAndModify : false,
useCreateIndex : true
}).then(() => {
console.log("Mongoose Bağlandı!");
}).catch(a => console.error(a));

DatabaseManager.connect(url).then(() => {
console.log("Monogsha Bağlandı!");
}).catch(a => console.error(a))

//-------------Events---------------\\

require('events').EventEmitter.prototype._maxListeners = 100;

// Command Loader
client.komutlar = new Discord.Collection();
client.aliases = new Discord.Collection();  
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  console.log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
   if(!f.endsWith('.js')) return 
    let props = require(`./commands/${f}`);
   if(!props.help) return
    console.log(`Yüklenen komut: { ${props.help.name} }`);
    client.komutlar.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
          global.commands = files;
    });
  });
});

// Prefix Avaible
client.on('message', async message => {
let p = config.prefix
let client = message.client;
if (message.author.bot) return;
if (!message.content.startsWith(p)) return;
let command = message.content.split(" ")[0].slice(p.length);
let params = message.content.split(" ").slice(1);
let cmd
if (client.komutlar.has(command)) {
cmd = client.komutlar.get(command);
} else if (client.aliases.has(command)) {
cmd = client.komutlar.get(client.aliases.get(command));
}
if (cmd) {
}
cmd.run(client, message, params, p);
})

//-------------Dashboard---------------\\

require("./app.js")(client);

//-------------Events---------------\\
const db = new Database("LEVELS")

client.on("message", message => {
  if(!message.guild || message.author.bot) return
	if (message.content === `site`) {
	  return message.channel.send(new Discord.MessageEmbed()
                                .setThumbnail(client.user.avatarURL())
                                .setFooter(config.footer)
                                .setColor("BLUE")
                                .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
                                .setDescription("Websitemiz için **[buraya](https://vcodes.xyz)** tıkla!"));
	}
  });

const codesSchema = require("./models/codes.js");

client.on('ready',async () => {
console.log("`" + client.user.username + "` Başarıyla Aktif Hale getirildi!");
let joinc = "824326250616979486";
client.channels.cache.get(joinc).join();
client.user.setPresence({ activity: { type: 'WATCHING', name: 'vcodes.xyz' }, status: "dnd" });
})


//---------- Search ------------\\

client.on('message', async message => {
if(message.channel.id != channels.search) return;
if(message.author.bot) return;
message.delete({ timeout: 500 })
let args = message.content.split(" ").slice(1);
let arama = args.slice(0).join(" ");
let data = await require('./models/codes.js').find({})
let filter = data.filter(a => a.codeName.toLowerCase().includes(message.content.toLowerCase()))
let map = ""
if(filter.length <= 0) {
map = `No results.`
}else{
filter.map(a => {
   
map += `${a.codeName} **->** [Click Here](https://vcodes.xyz/code/${a.code})\n`
})
}
const aramasonucu = new Discord.MessageEmbed()
.setDescription(`Search results for \`${message.content}\`\n\n${map}`)
.setColor("BLUE")
.setFooter(config.footer)
client.channels.cache.get(channels.results).send(message.author, aramasonucu)
})

//-------------Uptime---------------\\
const claudette = require("./models/uptime.js")
setInterval(() => {
claudette.find({}, function (err, docs) {
if(err) console.log(err)
if(!docs) return;
docs.forEach(docs => {
fetch(docs.link)
})
})
}, 60000)

client.on('guildMemberRemove', async member => {
    if(member.guild.id !== config.serverID) return
        claudette.find({ userID: member.id }, async function (err,docs) {
            await docs.forEach(async a => {
            await claudette.findOneAndDelete({ userID: member.id, code: a.code, server: a.server, link: a.link })
            })
        })
    })
    
//-------------Vote---------------\\
const votes = require('./models/botlist/vote.js')
client.on('ready', async () => {
setInterval(async () => {
let datalar = await votes.find()
if(datalar.length <= 0) return
datalar.forEach(async a => {
let süre = a.ms - (Date.now() - a.Date)
if(süre > 0) return
await votes.findOneAndDelete({ bot: a.bot, user: a.user })
})
}, 5000)
})
// MONTH RESET
const { CronJob } = require('cron')
const botlar = require('./models/botlist/bots.js')
client.on('ready', async () => {
var resetStats = new CronJob('00 00 1 * *', async function() { 
let x = await botlar.find()
await x.forEach(async a => {
await botlar.findOneAndUpdate({botID: a.botID},{$set: {votes: 0}})
})
client.channels.cache.get(channels.votes).send("All votes for this month have been deleted.")
}, null, true, 'Europe/Istanbul');
resetStats.start();
})
//-------------Vote---------------\\

//----------- DATA REFRESH ----------\\
client.on('ready', async () => {
    const botlar = require('./models/botlist/bots.js')
    setInterval(async () => {
    let x = await botlar.find()
    x.forEach(async a => {
    client.users.fetch(a.botID).then(async bot => {
    client.users.fetch(a.ownerID).then(async owner => {
    if(bot) {
    await botlar.findOneAndUpdate({botID: a.botID},{$set: {ownerName: owner.username, username: bot.username, discrim: bot.discriminator, avatar: bot.avatarURL() }})
    } else {
    await botlar.findOneAndDelete({ botID: a.botID })
    }
    })
    })
    })
    },5000)
    })
    
    async function getuser(id) {
    try {
    return await client.users.fetch(id)
    } catch (error) {
    return undefined
    }
    }
//----------- DATA REFRESH ----------\\
//----------- ROLE ---------------\\
client.on('ready', async () => {
    const botlar = require('./models/botlist/bots.js')
  setInterval(async () => {
  let serverID = config.serverID;
  let premiumID = roles.premium_developer;
  let developer = roles.developer;
  let sertifikaid = roles.certified_developer;
  let x = await botlar.find()
  // BOT DEVELOPERS
  let onayli = x.filter(a => a.status === 'Approved')
  onayli.forEach(a => {
  if(client.guilds.cache.get(serverID).members.cache.get(a.ownerID)) {
  if(!client.guilds.cache.get(serverID).members.cache.get(a.ownerID).roles.cache.has(developer)) client.guilds.cache.get(serverID).members.cache.get(a.ownerID).roles.add(developer)
  }
  a.coowners.forEach(b => {
  if(client.guilds.cache.get(serverID).members.cache.get(b)) {
  if(!client.guilds.cache.get(serverID).members.cache.get(b).roles.cache.has(developer)) {
      client.guilds.cache.get(serverID).members.cache.get(b).roles.add(developer)
  }
  }
  })
  })
  // CERTIFIED DEVELOPERS
  let sertifika = x.filter(a => a.certificate === 'Certified')
  sertifika.forEach(a => {
  if(client.guilds.cache.get(serverID).members.cache.get(a.ownerID)) {
  if(!client.guilds.cache.get(serverID).members.cache.get(a.ownerID).roles.cache.has(sertifikaid)) client.guilds.cache.get(serverID).members.cache.get(a.ownerID).roles.add(sertifikaid)
  }
  a.coowners.forEach(b => {
  if(client.guilds.cache.get(serverID).members.cache.get(b)) {
  if(!client.guilds.cache.get(serverID).members.cache.get(b).roles.cache.has(sertifikaid)) {
      client.guilds.cache.get(serverID).members.cache.get(b).roles.add(sertifikaid)
  }

  }
  })
  })
  // PREMIUM DEVELOPERS
  let premium = x.filter(a => a.premium === 'Premium')
  premium.forEach(a => {
  if(client.guilds.cache.get(serverID).members.cache.get(a.ownerID)) {
  if(!client.guilds.cache.get(serverID).members.cache.get(a.ownerID).roles.cache.has(premiumID)) client.guilds.cache.get(serverID).members.cache.get(a.ownerID).roles.add(premiumID)
  }
  a.coowners.forEach(b => {
  if(client.guilds.cache.get(serverID).members.cache.get(b)) {
  if(!client.guilds.cache.get(serverID).members.cache.get(b).roles.cache.has(premiumID)) {
  client.guilds.cache.get(serverID).members.cache.get(b).roles.add(premiumID)
  }
  }
  })
  })
  }, 10000)
  })
  //----------- ROLE ---------------\\

client.login(settings.token);
