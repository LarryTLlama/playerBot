const { SlashCommandBuilder, EmbedBuilder, CommandInteraction, Client, AttachmentBuilder } = require('discord.js');
const axios = require("axios")
const util = require("minecraft-server-util")
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

const slashCommandData = new SlashCommandBuilder()
    .setName('busy')
    .setDescription("Check how busy the server is");

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 */
const slashCommandFunction = async (client, interaction) => {
    let inside = await axios.get("https://web.peacefulvanilla.club/maps/tiles/players.json")
	let outside = await util.status("mc.peacefulvanilla.club", 25565)
    let waiting = outside.players.online - inside.data.players.length;
    const embed = new EmbedBuilder()
        .setTitle(`Is PVC Busy?`)
        .setDescription(`PVC is currently **${outside.players.online > 30 ? "Busy" : "Not Busy"}**`)
        .addFields([
            { name: 'Players playing:', value: `${inside.data.players.length}` , inline: true },
            { name: 'Players in queue:', value: `${waiting}`, inline: false },
            { name: 'Total players:', value: `${outside.players.online}`, inline: true },
        ])
        .setTimestamp()
        .setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
        interaction.reply({embeds: [embed]})
}


module.exports = {
    data : slashCommandData,
    execute: slashCommandFunction
}
