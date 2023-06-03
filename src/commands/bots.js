const Discord = require("discord.js");
const botdata = require("../database/models/botlist/bots.js");

module.exports = {
  name: "bots",
  description: "Shows the bots you have added to this botlist.",
  
  run: async (client, interaction) => {
    try {
    let x = await botdata.find();

    let bots = await x.filter(
      (a) =>
        a.ownerID == interaction.user.id || a.coowners.includes(interaction.user.id)
    );

    if (!bots) return interaction.reply({
      content: "You haven't added any bots to this botlist.",
      ephemeral: true
    });

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
      .setDescription(`**Total ${bots.length} bots found.**`)
      .setColor("#7289da")
      .addFields([
        { name: "Bots", value: `${!bots ? "" : bots.map((a) => "<@" + a.botID + ">").join("\n") || "No Bots Found."}`, inline: true }
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