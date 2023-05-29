const botsdata = require("../database/models/botlist/bots.js");
const Discord = require('discord.js');
const roles = global.config.server.roles;

module.exports = {
  name: "queue",
  description: "Shows the bots queue.",

  run: async (client, interaction) => {
    try {
    if (!global.config.bot.owners.includes(interaction.user.id)) return interaction.reply("You are not a member of the staff team.")

    let x = await botsdata.find();
    let bots = await x.filter(a => a.status === "UnApproved")

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
      .setDescription(`**Total ${bots.length} bots in queue.**`)
      .setColor("#7289da")
      .addFields([
        { name: "Bots", value: `${!bots ? "" : bots.map((a) => `bot:${a.username}\nbot invite link (default url): [CLICK Here](https://vcodes.xyz/bot/${a.botID}/invite)\nperm 0 link: [PERM 0](https://discord.com/api/oauth2/authorize?client_id=${a.botID}&permissions=0&scope=bot%20applications.commands)`).join("\n") || "No Bots currently in queue."}`, inline: true }
      ])

    interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error)
      interaction.reply({
        content: "An error occured while running this command.",
        ephemeral: true
      })
    }
  }
};