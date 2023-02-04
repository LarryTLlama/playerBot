const { SlashCommandBuilder, EmbedBuilder, CommandInteraction, Client, AttachmentBuilder } = require('discord.js');
const axios = require("axios")
const puppeteer = require("puppeteer");
const sharp = require("sharp")
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
const capture = async (pag, time) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(pag);
  await delay(time)
  await page.mouse.click(771, 27, {button: 'left'})
  await page.mouse.click(707, 36, {button: 'left'})
  await page.mouse.click(648, 42, {button: 'left'})
  let scrnsht = await page.screenshot({encoding: "base64"});
  await browser.close();
  return scrnsht
};

const slashCommandData = new SlashCommandBuilder()
    .setName('seen')
    .setDescription("See when a player was last online")
    .addStringOption(option =>
		option.setName('player')
			.setDescription('The player to search for')
			.setAutocomplete(true)
            .setRequired(true)
        );

const autocompleteFunction = async (interaction) => {
    const focusedValue = interaction.options.getFocused();
    let res = await axios.get("https://web.peacefulvanilla.club/maps/tiles/players.json")
    console.log(res)
	let choices = []
    res.data.players.forEach((player) => {choices.push(player.name)})
	let filtered = choices.filter(choice => choice.startsWith(focusedValue));
	await interaction.respond(
		filtered.map(choice => ({ name: choice, value: choice })),
	);
}


/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 */
const slashCommandFunction = async (client, interaction) => {
    console.log("Defer")
    await interaction.deferReply();
    const string = interaction.options.getString('player');
    let {database} = require("../../events/client/ready.js");
    
    let q = await database.query(string);
    console.log(q)
    if(q) {
    const embed = new EmbedBuilder()
        .setTitle(`Last Join information for ${string}`)
        .setThumbnail(`https://crafatar.com/renders/body/${q.uuid}` || "https://cdn.discordapp.com/attachments/814164805174427650/1060918435212705832/220px-Steve_28Minecraft29.png")
        .setDescription(`${string} last joined ${q.get('lastjoin').toDateString()} at ${q.get('lastjoin').toTimeString()}. \nThat was <t:${(q.get('lastjoin').getTime() / 1000).toString().split(".")[0]}:R> `)
        .setTimestamp()
        .setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
    
    return interaction.editReply({ content: ' ', embeds: [embed] });
    }
    interaction.editReply("Player not found. (We might not have any seen data for them yet!)")
}


module.exports = {
    data : slashCommandData,
    autocomplete: autocompleteFunction,
    execute: slashCommandFunction,
}
