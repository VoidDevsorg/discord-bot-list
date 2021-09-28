/*=======================================================================================*/
const Discord = require("discord.js");
const { Client, Collection } = require("discord.js");
const client = (global.Client = new Client())
const config = require("./config.js");
global.config = config;
const fs = require("fs");
client.htmll = require('cheerio');
const request = require("request");
const db = require("quick.db");
const botsdata = require('./src/database/models/botlist/bots.js');
const ms = require('parse-ms');
/*=======================================================================================*/



/*=======================================================================================*/
require('events').EventEmitter.prototype._maxListeners = 100;
client.komutlar = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./src/commands", (err, files) => {
    if (err) console.error(err);
    console.log(`[vcodes.xyz]: ${files.length} command loaded.`);
    files.forEach(f => {
        if (!f.endsWith('.js')) return
        let props = require(`./src/commands/${f}`);
        if (!props.help) return
        client.komutlar.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
            global.commands = files;
        });
    });
});
client.on('message', async message => {
    let p = config.bot.prefix
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
    if(cmd) {
        cmd.run(client, message, params, p);
    }
    if(!cmd) return;
})
/*=======================================================================================*/


/*=======================================================================================*/
const claudette = require("./src/database/models/uptime.js")
    setInterval(() => {
        claudette.find({}, function (err, docs) {
            if(err) console.log(err)
            if(!docs) return;
            docs.forEach(docs => {
                request(docs.link, async function(error, response, body) {
                  if(error) {
                    console.error(`${docs.link} has been deleted on uptime system.\nReason: Invalid domain so request failed.`);
                    await claudette.findOneAndDelete({ code: docs.code })
                  }
                });
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
/*=======================================================================================*/

client.on('presenceUpdate', async(oldPresence, newPresence) => 
{
  
   var botdata = await botsdata.findOne({ botID: newPresence.userID });
      if(!botdata)
      {
        return
      }

    if(newPresence.guild.id == config.server.id)
    {
     if(botdata.status == "UnApproved")

     {
       return;
     }

  if (newPresence.status === 'offline') {
   
    var uptimerate = db.fetch(`rate_${newPresence.userID}`);
  
if(!uptimerate)
      {
             var uptimerate = "99";
             db.set(`rate_${newPresence.userID}`, 99)
      }
      
      var timetest = db.fetch(`timefr_${newPresence.userID}`)
      var timetest = Date.now() - timetest;
      let breh = db.fetch(`lastoffline`)
     
      if(timetest > 60000)
      {
      
         db.set(`presence_${newPresence.userID}`, "offline")
          db.set(`timefr_${newPresence.userID}`, Date.now())
       db.add(`offlinechecks_${newPresence.userID}`, 1)
        
      
      let emb = new Discord.MessageEmbed()
      	.setAuthor(" Uptime Logs")
      	.setTitle("Downtime Alert!")
       	.addField(`Bot`, `\`${newPresence.user.tag}\``, true)
       	.addField(`Uptime Rate`, `**${uptimerate}%**`, true)
        .setColor("#FF0000")
        db.add(`checks_${newPresence.userID}`, 1)
      if(client.users.cache.get(botdata.ownerID)) {
          client.channels.cache.get(config.server.channels.botlog).send(`<@${botdata.ownerID}>`, emb) 
      } else {
          client.channels.cache.get(config.server.channels.botlog).send(emb) 
      }
      }
      
      
    
    
      
      
  }
  if (newPresence.status === 'online' || newPresence.status === "dnd" || newPresence.status === "afk") {
    let check = db.fetch(`presence_${newPresence.userID}`);
    if(check === "offline")
    {

      var uptimerate = db.fetch(`rate_${newPresence.userID}`);
   
   if(!uptimerate)
      {
             var uptimerate = "99";
      }
        
        db.set(`presence_${newPresence.userID}`, "online")
        
        let to2 = db.fetch(`timefr_${newPresence.userID}`);
        var timeleft = await ms(Date.now() - to2);
        var hour = timeleft.hours;
       var minutes = timeleft.minutes;
       var seconds = timeleft.seconds;
      
       db.set(`lastoffline`, newPresence.userID);
       let emb = new Discord.MessageEmbed()
        .setAuthor(" Uptime Logs")
        .setTitle("Uptime Alert!")
       	.addField(`Bot`, `\`${newPresence.user.tag}\``, true)
       	.addField(`Uptime Rate`, `**${uptimerate}%**`, true)
       	.addField(`Downtime`, `\`${hour}\`h \`${minutes}\`m \`${seconds}\`s`, false)
        .setColor("#00FF00")
         db.add(`checks_${newPresence.userID}`, 1)
       if(client.users.cache.get(botdata.ownerID)) {
           client.channels.cache.get(config.server.channels.botlog).send(`<@${botdata.ownerID}>`, emb) 
       } else {
           client.channels.cache.get(config.server.channels.botlog).send(emb) 
       }
       db.set(`timefr_${newPresence.userID}`, Date.now())
    }
    }
    
    }
    

})
client.on('ready',async () => {
    setInterval(async() => {
             var botdata = await botsdata.find();
        botdata.forEach(rnxd => {
            
        
         let chekb = db.fetch(`timefr_${rnxd.botID}`);
        if(!chekb)
            {
                db.set(`timefr_${rnxd.botID}`, Date.now());
            }
            
    })
        
    }, 5000)
      setInterval(async() => {
          
         
         let target = db.fetch(`targetv`);
         if(!target) return;
               var botdata = await botsdata.find();
        botdata.forEach(rnxd => {
        
        
        if(rnxd.votes === target)
            {
                db.delete(`targetv`);
                client.channels.cache.get("876784483565715466").send(`:tada: :tada: <@${rnxd.botID}> has Reached the Vote Target of ${target} Owner of Bot: <@${rnxd.ownerID}> :tada: :tada:`);
            }
            
            
    })
        
            
    
        
    }, 20000)
    setInterval(async() =>{
      
      var botdata = await botsdata.find();
      if(!botdata)
      {
        return
      }
      botdata.forEach(bot => {
        
           db.add(`checks_${bot.botID}`, 1);
           var check = db.fetch(`presence_${bot.botID}`);
           if(check === "offline")
           {
           
             db.add(`offlinechecks_${bot.botID}`, 1)
             
           }
        
      })
    }, 120000);
    // random bots
    setInterval(async() => {
      var botdata = await botsdata.find();
        botdata.forEach(async(bot) =>{
            if(client.users.cache.get(bot.botID))
                {
                    if(bot.status === "UnApproved")
                        {
return; }
             if(client.users.cache.get(bot.botID).presence.status === "offline")
                 {
                      var timetest = db.fetch(`timefr_${bot.botID}`)
      var timetest = Date.now() - timetest;
      let breh = db.fetch(`lastoffline`)
     
      if(timetest > 60000)
      {
      
        
        if(breh === bot.botID)
      {
        return;
      }
                      let check = db.fetch(`presence_${bot.botID}`);
    if(check === "offline")
    { return; }
                           db.set(`lastoffline`, bot.botID);
                   db.set(`presence_${bot.botID}`, "offline");
                     db.set(`timefr_${bot.botID}`, Date.now())
       db.add(`offlinechecks_${bot.botID}`, 1)
                 }
                 } else {
                       let check = db.fetch(`presence_${bot.botID}`);
                     if(check === "offline")
                         {
                             
                      db.set(`presence_${bot.botID}`, "Online");
                               let to2 = db.fetch(`timefr_${bot.botID}`);
        var timeleft = await ms(Date.now() - to2);
        var hour = timeleft.hours;
       var minutes = timeleft.minutes;
       var seconds = timeleft.seconds;
                     db.delete(`timefr_${bot.botID}`);
                    
                           
                              db.set(`timefr_${bot.botID}`, Date.now())
                              var uptimerate = db.fetch(`rate_${bot.botID}`);
                              let emb = new Discord.MessageEmbed()
        .setAuthor("Uptime Logs")
        .setTitle("Uptime Alert!")
       	.addField(`Bot`, `\`${bot.username}\``, true)
       	.addField(`Uptime Rate`, `**${uptimerate}%**`, true)
       	.addField(`Downtime`, `\`${hour}\`h \`${minutes}\`m \`${seconds}\`s`, false)
        .setColor("#00FF00")
         db.add(`checks_${bot.botID}`, 1)
       if(client.users.cache.get(bot.ownerID)) {
           client.channels.cache.get(config.server.channels.botlog).send(`<@${bot.ownerID}>`, emb) 
       } else {
           client.channels.cache.get(config.server.channels.botlog).send(emb) 
       }
                         }
                     
                 }
                }
        })
       
    
    }, 5000)
   
    setInterval(async() =>{
      
      var botdata = await botsdata.find();
      if(!botdata)
      {
        return
      }
      botdata.forEach(async (bot) => {
        var checking = db.fetch(`rate_${bot.botID}`);
        if(checking)
        {
      
           var check = db.fetch(`presence_${bot.botID}`);
           db.add(`checks_${bot.botID}`, 1)
           if(check === "offline")
           {
             if(checking < 40)
             {
               let done = db.fetch(`don_${bot.botID}`);
               if(done == "yes")
               {
                 return;
               }
                let declineembed = new Discord.MessageEmbed()
             .setTitle("Bot Deleted")
             .setDescription(`Reason: Bot Uptime was Gone Under 50%\n Moderator: ${client.user.username}\n Bot: <@${bot.botID}>\n Owner: <@${bot.ownerID}>`)
             .setFooter("Embed Logs of Administration")
               client.channels.cache.get(config.channels.botlog).send(declineembed)
               if(client.guilds.cache.get(config.server.id).members.fetch(bot.ownerID))
               {
               client.users.cache.get(bot.ownerID).send(`Your bot named **<@${bot.botID}>** has been deleted.\nReason: **Uptime was gone under 50%**\nAuthorized: **${client.user.username}**`)
               
                  await botsdata.deleteOne({ botID: bot.botID, ownerID: bot.ownerID, botid: bot.botID })
                  db.set(`don_${bot.botID}`, "yes");
             }
              let guild = client.guilds.cache.get(config.server.id);
        var bot1 = guild.member(bot.botID)
        bot1.kick()
             } 
            db.add(`offlinechecks_${bot.botID}`, 1)
             
             db.set(`rate_${bot.botID}`, checking - 1)
           }
        }
      })
    }, 7200000);
    

 
})
/*=======================================================================================*/




/*=======================================================================================*/
const votes = require('./src/database/models/botlist/vote.js')
const votesServer = require('./src/database/models/servers/user.js')
client.on('ready', async () => {
        setInterval(async () => {
            let datalar = await votes.find()
            if(datalar.length > 0) {
            datalar.forEach(async a => {
                let süre = a.ms - (Date.now() - a.Date)
                if(süre > 0) return
                await votes.findOneAndDelete({ bot: a.bot, user: a.user })
            })
            }
        }, 1500000)
})
client.on('ready', async () => {
        setInterval(async () => {
            let voteServer = await votesServer.find()
            if(voteServer.length > 0) {
            voteServer.forEach(async a => {
                let süre = 1800000 - (Date.now() - a.date)
                if(süre > 0) return
                await votesServer.findOneAndDelete({ guild: a.guild, id: a.id, date: a.date })
            })
            }
        }, 1500000)
})
/*=======================================================================================*/


/*=======================================================================================*/
client.on('guildMemberRemove', async member => {
    const botlar = require('./src/database/models/botlist/bots.js')
    let data = await botlar.findOne({ ownerID: member.id })
    if(!data) return
    let find = await botlar.find({ ownerID: member.id })
    await find.forEach(async b => {
        member.guild.members.cache.get(b.botID).kick();
        await botlar.deleteOne({ botID: b.botID })
    })
})
client.on("guildMemberAdd", async (member) => {
  let guild = client.guilds.cache.get(config.server.id);
  if (member.user.bot) {
    try {
      guild.member(member.id).roles.add(config.server.roles.botlist.bot);
    } catch (error) {
      
    }
  }
});
/*=======================================================================================*/


/*
    SERVER LIST CLIENT 
*/
const serverClient = new Client();
serverClient.login(config.bot.servers.token);
global.clientSL = serverClient;
require("./src/servers/client.js");


/*=======================================================================================*/
require("./src/server.js")(client);
require("./src/database/connect.js")(client);

client.login(config.bot.token);
client.on('ready',async () => {
    console.log("[vcodes.xyz]: Bot successfully connected as "+client.user.tag+".");
    let botsSchema = require("./src/database/models/botlist/bots.js");
    const bots = await botsSchema.find();
    client.user.setPresence({ activity: { type: 'WATCHING', name: 'vcodes.xyz | '+bots.length+' bots' }, status: "dnd" });
});
/*=======================================================================================*/

/* RESET DATA'S EVERY MONTHS */

// BOT/SERVER VOTES & ANALYTICS
const {
    CronJob
} = require('cron')
const botlar = require('./src/database/models/botlist/bots.js')
const servers = require('./src/database/models/servers/server.js')
client.on('ready', async () => {
    var resetStats = new CronJob('00 00 1 * *', async function() {
        let x = await botlar.find()
        await x.forEach(async a => {
            await botlar.findOneAndUpdate({
                botID: a.botID
            }, {
                $set: {
                    votes: 0,
                    analytics_invites: 0,
                    analytics_visitors: 0,
                    country: {},
                    analytics: {}
                }
            })
        })
        let sunucular = await servers.find()
        await sunucular.forEach(async a => {
            await servers.findOneAndUpdate({
                id: a.id
            }, {
                $set: {
                    votes: 0,
                    bumps: 0,
                    analytics_joins: 0,
                    analytics_visitors: 0,
                    country: {},
                    analytics: {}
                }
            })
        })
    }, null, true, 'Europe/Istanbul');
    resetStats.start();
})
