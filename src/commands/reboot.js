const Discord = require("discord.js");
const fetch = require("node-fetch");
const { spawn } = require("child_process");

module.exports = {
  name: "reboot",
  description: "Reboots the botlist.",

  run: async (client, interaction) => {
    try {
      if (!global.config.bot.owners.includes(interaction.user.id)) return interaction.reply("You are not a member of the staff team.");

      const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
        .setDescription(`**Rebooting the botlist.**`)
        .setColor("#7289da");

      const message = await interaction.reply({ embeds: [embed] });

      setTimeout(() => {
        const child = spawn("npm", ["start"], { detached: true, stdio: "inherit" });
        child.unref();
        process.exit();
      }, 1000);

    } catch (error) {
      console.log(error);
      interaction.reply({
        content: "An error occurred while running this command.",
        ephemeral: true
      });
    }
  }
};