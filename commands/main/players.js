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
  await page.waitForTimeout(3000);
  await page.mouse.click(771, 27, {button: 'left'})
  await page.mouse.click(707, 36, {button: 'left'})
  await page.mouse.click(648, 42, {button: 'left'})
  let scrnsht = await page.screenshot({encoding: "base64"});
  await browser.close();
  return scrnsht
};

const slashCommandData = new SlashCommandBuilder()
    .setName('player')
    .setDescription("Get player info")
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
    console.log(await capture("https://google.com"))
    const string = interaction.options.getString('player');
    let res = await axios.get("https://web.peacefulvanilla.club/maps/tiles/players.json")
	let choices = []
    res.data.players.forEach((player) => {choices.push(player.name)})
    if(choices.findIndex(e => e == string) == -1) return interaction.reply("This player is no longer (or has never been) online")
    console.log(string) 
    await interaction.reply({ content: `Searching for ${string} 🔎`, fetchReply: true });
    const playerInfo = res.data.players.find((x) => x.name == string) 
    console.log(`http://web.peacefulvanilla.club/maps#${playerInfo.world};flat;${playerInfo.x},64,${playerInfo.z};7`)
    let screenshot = await Buffer.from(await capture(`http://web.peacefulvanilla.club/maps#${playerInfo.world};flat;${playerInfo.x},100,${playerInfo.z};7`, 1500), "base64")
    let newscreenshot = await sharp(screenshot)
                            .resize(800, 600)
                            .extract({ left: 100, top: 100, width: 600, height: 400 })
                            .toBuffer()
    let attachment = new AttachmentBuilder(newscreenshot, {name: "screenshot.png"})
    let dimension = "In the vast emptiness of 'No-World'";
    if(playerInfo.world == "World") {
        dimension = "Overworld"
    } else if(playerInfo.world == "World_nether") {
        dimension = "Nether"
    } else if(playerInfo.world == "World_the_end") {
        dimension = "The End"
    }
    const embed = new EmbedBuilder()
        .setTitle(`Latest info for ${string}`)
        .setThumbnail(`https://crafatar.com/renders/body/${playerInfo.uuid}` || "https://cdn.discordapp.com/attachments/814164805174427650/1060918435212705832/220px-Steve_28Minecraft29.png")
        .addFields([
            { name: 'Location:', value: `\`${playerInfo.x}, ${playerInfo.z}\` (Facing ${playerInfo.yaw}°)` , inline: true },
            { name: 'Dimension:', value: `${dimension}`, inline: false },
            { name: 'Health:', value: `${playerInfo.health}`, inline: true },
            { name: 'Armour:', value: `${playerInfo.armor}`, inline: false },
        ])
        .setTimestamp()
        .setImage("attachment://screenshot.png")
        .setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
    
    interaction.editReply({ content: ' ', embeds: [embed], files: [attachment] });
}


module.exports = {
    data : slashCommandData,
    autocomplete: autocompleteFunction,
    execute: slashCommandFunction,
}
