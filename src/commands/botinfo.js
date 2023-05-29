const Discord = require("discord.js");
const bots = require("../database/models/botlist/bots.js");

module.exports = {
  name: "botinfo",
  description: "Shows the bot information of a bot added to this botlist.",
  options: [
    {
      name: "id",
      description: "The id of the bot you want to see information about.",
      type: 3,
      required: true
    }
  ],

  run: async (client, interaction) => {
    try {
    let id = interaction.options.getString("id");
    const bot = await bots.findOne({ botID: id });

    if (!bot) return interaction.reply({
      content: "No bot found with this id.",
      ephemeral: true
    });

    const embed = new Discord.EmbedBuilder()
    .setThumbnail()
    .setAuthor({ name: bot.username, iconURL: bot.avatar })
    .setColor("#7289da")
    .setDescription(
      "**[Vote for " +
      bot.username +
        "#" +
        bot.discrim +
        " on the vCodes website](https://vcodes.xyz/bot/" +
        bot.botID +
        "/vote)**"
    )
    .addFields([
      { name: "ID", value: `${bot ? bot.botID : "undefined"}`, inline: true },
      { name: "Username", value: `${bot ? bot.username : "undefined"}`, inline: true },
      { name: "Discriminator", value: `${bot ? bot.discrim : "undefined"}`, inline: true },
      { name: "Votes", value: `${bot ? bot.votes : "0"}`, inline: true },
      { name: "Certificate", value: `${bot ? bot.certificate : "undefined"}`, inline: true },
      { name: "Short Description", value: `${bot ? bot.shortDesc : "undefined"}`, inline: true },
      { name: "Server Count", value: `${bot ? bot.serverCount : "undefined"}`, inline: true },
      { name: "Owner", value: `${bot ? `<@${bot.ownerID}>` : "undefined"}`, inline: true },
      { name: "Co-Owner(s)", value: `${bot ? `${
        bot.coowners.map((x) => `<@${x}>`).join(", ") || "N/A"
      }` : "undefined"}`, inline: true },
      { name: "Links", value: `${bot ? `[Invite](https://discord.com/oauth2/authorize?client_id=${bot.botID}&scope=bot applications.commands&permissions=8)${bot.website ? `\n[Website](${bot.website})` : ""}${bot.discord ? `\n[Discord](${bot.discord})` : ""}${bot.github ? `\n[Github](${bot.github})` : ""}` : "undefined"}`, inline: true },
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