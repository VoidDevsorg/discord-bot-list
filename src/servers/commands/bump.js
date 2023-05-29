const Discord = require("discord.js");
const { registerFont, createCanvas } = require("canvas");
const serverData = require("../../database/models/servers/server.js");

module.exports = {
  name: "bump",
  description: "Bump your / this server.",
  options: [],
  
  run: async (client, interaction) => {
    try {
    let message = interaction;

    let findServer = await serverData.findOne({ id: message.guild.id });
    if (!findServer) return await interaction.reply({
      content: "This server was not found in our list.\nAdd your server: https://vcodes.xyz/server/add"
    });

    let cooldown = 1800000;
    let lastDaily = findServer.bump;
    if (cooldown - (Date.now() - lastDaily) > 0) {
      return await msgError("This command is used only once every 30 minutes.", {
        interaction: interaction,
        reply: true
      });
    } else {
      await interaction.reply({
        content: "⚡ \`\`|\`\` Please wait while we are preparing the captcha.",
        ephemeral: true
      });

      let kod1 = client.makeid(6);
      let kod2 = client.makeid(6);
      let kod3 = client.makeid(6);
      const width = 400;
      const height = 125;
      const canvas = createCanvas(width, height);
      const context = canvas.getContext("2d");
      await registerFont("src/fonts/font.ttf", { family: "vCodes" });
      context.fillRect(0, 0, width, height);
      context.font = "bold 60pt vCodes";
      context.textAlign = "center";
      context.fillStyle = "#fff";
      context.fillText(kod1, 200, 90);
      const attachment = new Discord.AttachmentBuilder(
        canvas.toBuffer(),
        "captcha.png"
      );
      let sorgu = new Discord.ButtonBuilder()
        .setLabel(kod1)
        .setStyle("Primary")
        .setCustomId(kod1);
      let sorgu2 = new Discord.ButtonBuilder()
        .setLabel(kod2)
        .setStyle("Primary")
        .setCustomId(kod2);
      let sorgu3 = new Discord.ButtonBuilder()
        .setLabel(kod3)
        .setStyle("Primary")
        .setCustomId(kod3);
      let web = new Discord.ButtonBuilder()
        .setStyle("Link")
        .setLabel("Visit server page")
        .setURL("https://vcodes.xyz/server/" + interaction.guild.id);

      let row = new Discord.ActionRowBuilder().addComponents(
        sorgu,
        sorgu2,
        sorgu3,
        web
      );
      
      await interaction.editReply({
        content: `**Bump your server.**\n**Please click the button that matches the code.**`,
        files: [attachment],
        components: [row],
        ephemeral: true
      });
      let filter = (b) => b.user.id === interaction.user.id;
      let collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });
      collector.on("collect", async (i) => {
        if (i.customId === kod1) {
          await interaction.editReply({
            content: null,
            embeds: [
              new Discord.EmbedBuilder()
                .setAuthor({
                  name: global.clientSL.user.username,
                  iconURL: global.clientSL.user.avatarURL(),
                })
                .setColor("#00ff00")
                .setDescription("✅ \`\`|\`\` **Your server has been successfully bumped.**\n\n> **You can bump your server again in 30 minutes.**")
                .setFooter({
                  text: interaction.user.username,
                  iconURL: interaction.user.avatarURL(),
                })
            ],
            files: [],
            components: [],
            ephemeral: true
          });
          await serverData.findOneAndUpdate(
            { id: message.guild.id },
            { $set: { bump: Date.now(), bumps: findServer.bumps + 1 } }
          );
        } else {
          await interaction.editReply({
            content: null,
            embeds: [
              new Discord.EmbedBuilder()
                .setAuthor({
                  name: global.clientSL.user.username,
                  iconURL: global.clientSL.user.avatarURL(),
                })
                .setColor("#ff0000")
                .setDescription("❌ \`\`|\`\` **You clicked the wrong button.**")
                .setFooter({
                  text: interaction.user.username,
                  iconURL: interaction.user.avatarURL(),
                })
            ],
            files: [],
            components: [],
            ephemeral: true
          });
        }
      });

      collector.on("end", async (collected) => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: `**You have not clicked any button.**\n**Please try again.**`,
            embeds: [
              new Discord.EmbedBuilder()
                .setAuthor({
                  name: global.clientSL.user.username,
                  iconURL: global.clientSL.user.avatarURL(),
                })
                .setColor("#ff0000")
                .setDescription("❌ \`\`|\`\` **You have not clicked any button.**\n\n> **Please try again.**")
                .setFooter({
                  text: interaction.user.username,
                  iconURL: interaction.user.avatarURL(),
                })
            ],
            components: [],
            ephemeral: true
          });
        }
      });
    }
  }
  catch (err) {
    console.log(err);
  }
  },
};

function msgError(msg, { interaction, reply /* reply = true ? reply : editReply */ }) {
  if (reply) {
  interaction.reply({
    embeds: [
    new Discord.EmbedBuilder()
      .setAuthor({
        name: global.clientSL.user.username,
        iconURL: global.clientSL.user.avatarURL(),
      })
      .setFooter({ text: "vcodes.xyz/servers" })
      .setDescription(msg)
      .setColor("#ff0000")
    ],
    ephemeral: true
  });
  } else {
    interaction.editReply({
      embeds: [
      new Discord.EmbedBuilder()
        .setAuthor({
          name: global.clientSL.user.username,
          iconURL: global.clientSL.user.avatarURL(),
        })
        .setFooter({ text: "vcodes.xyz/servers" })
        .setDescription(msg)
        .setColor("#ff0000")
      ],
      ephemeral: true
    });
  }
}