//-------------CLIENT---------\\
const Discord = require("discord.js");
const settings = require("./settings.json");
const { Client, Collection } = require("discord.js");
const client = (global.Client = new Client())
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
const codesSchema = require("./models/codes.js");
client.on('ready',async () => {
console.log("`" + client.user.username + "` Başarıyla Aktif Hale getirildi!");
client.user.setPresence({ activity: { type: 'WATCHING', name: 'vcodes.xyz' }, status: "dnd" });
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
}, 300000)

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
}, 1500000)
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

//----------- BOT LIST JOIN & LEAVE SYSTEMS  ---------------\\
client.on('guildMemberRemove', async member => {
  const botlar = require('./models/botlist/bots.js')
  let data = await botlar.findOne({ ownerID: member.id })
  if(!data) return
  let find = await botlar.find({ ownerID: member.id })
  await find.forEach(async b => {
  member.guild.members.cache.get(b.botID).kick();
  await botlar.deleteOne({ botID: b.botID })
  })
})
client.on("guildMemberAdd", async (member) => {
  let guild = client.guilds.cache.get(config.serverID);
  if (member.user.bot) {
    try {
      guild.member(member.id).roles.add(roles.bot);
    } catch (error) {
      
    }
  }
});
//----------- BOT LIST JOIN & LEAVE SYSTEMS ---------------\\

client.login(settings.token);
